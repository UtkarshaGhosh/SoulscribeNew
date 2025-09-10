import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react";
import { MoodSelector } from "./MoodSelector";
import { ChatMessage } from "./ChatMessage";
import { useAddChatMessage, useChatMessages, useAddMoodEntry, useClearChat } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";

import { useEffect, useMemo, useState } from "react";
export type Mood = "happy" | "sad" | "angry" | "anxious" | "calm" | "stressed" | "excited" | "lonely" | "frustrated" | "motivated";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  mood?: Mood;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMoodChange?: (mood: Mood) => void;
}

function initialMessages(): Message[] {
  const now = new Date();
  return [
    {
      id: "warning",
      content:
        "Caution: I am an AI assistant and not a licensed mental health professional. This chat is for supportive, general guidance only. If you are in crisis or have concerns about your safety, please contact local emergency services or a trusted professional immediately.",
      isUser: false,
      timestamp: now,
    },
    {
      id: "welcome",
      content:
        "Hello. I’m a non-human, non-judgmental mental therapist. I’m here to listen and support you. What’s on your mind today?",
      isUser: false,
      timestamp: now,
    },
  ];
}

export const ChatInterface = ({ onMoodChange }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const { data: history } = useChatMessages();
  const addMessage = useAddChatMessage();
  const addMood = useAddMoodEntry();
  const clearChat = useClearChat();
  const [clearCutoff, setClearCutoff] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const cutoffKey = useMemo(() => (userId ? `chatClearCutoff:${userId}` : null), [userId]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      const key = data.user?.id ? `chatClearCutoff:${data.user.id}` : null;
      if (key) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const d = new Date(stored);
          if (!isNaN(d.getTime())) setClearCutoff(d);
        }
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const key = `chatClearCutoff:${uid}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const d = new Date(stored);
          if (!isNaN(d.getTime())) setClearCutoff(d);
        } else {
          setClearCutoff(null);
        }
      } else {
        setClearCutoff(null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (history) {
      const mapped = history.map((m) => ({
        id: m.id,
        content: m.message,
        isUser: m.is_user,
        mood: m.mood_context ?? undefined,
        timestamp: new Date(m.created_at),
      }));
      const filtered = clearCutoff ? mapped.filter((m) => m.timestamp > clearCutoff) : mapped;
      if (filtered.length > 0) {
        setMessages(filtered);
      } else {
        setMessages(initialMessages());
      }
    } else {
      setMessages(initialMessages());
    }
  }, [history, clearCutoff]);

  const [isGenerating, setIsGenerating] = useState(false);

  const callAI = async (history: Message[], mood?: Mood) => {
    try {
      setIsGenerating(true);
      const payload = { messages: history.slice(-10), mood };
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.status === 404) {
        console.error('AI endpoint not found (404): /api/generate');
        return "The AI service is not available right now.";
      }
      if (resp.status === 401) {
        console.error('AI endpoint unauthorized (401)');
        return "The AI service is unauthorized. Please check server configuration.";
      }

      const text = await resp.text();
      let json: any = {};
      if (text) {
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse AI response text', e, text);
          return "I'm having trouble understanding the AI response.";
        }
      }

      const reply = json?.reply ?? null;
      if (!reply) {
        console.error('No reply field in AI response', json);
        return "The AI did not return a reply.";
      }

      return reply as string;
    } catch (err) {
      console.error('AI call failed', err);
      return "I'm having trouble responding right now. Please try again later.";
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    addMessage.mutate({ message: inputMessage, is_user: true });
    setInputMessage("");

    const historyForAI = [...messages, newMessage];
    const aiText = await callAI(historyForAI);

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: aiText,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiResponse]);
    addMessage.mutate({ message: aiText, is_user: false });
  };

  const handleMoodSelect = (mood: Mood) => {
    onMoodChange?.(mood);

    const moodMessage: Message = {
      id: Date.now().toString(),
      content: `I'm feeling ${mood} right now.`,
      isUser: true,
      mood,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, moodMessage]);
    addMood.mutate({ mood });
    addMessage.mutate({ message: moodMessage.content, is_user: true, mood_context: mood });

    setTimeout(() => {
      const moodResponses = {
        happy: "That's wonderful to hear! What's bringing you joy today?",
        sad: "I'm sorry you're feeling sad. Would you like to talk about what's weighing on your heart?",
        angry: "I can sense your frustration. Let's work through these feelings together.",
        anxious: "Anxiety can be overwhelming. Let's try some grounding techniques to help you feel centered.",
        calm: "It's beautiful that you're feeling calm. How did you achieve this peaceful state?",
        stressed: "Stress can be really challenging. What's been the biggest source of pressure lately?",
        excited: "Your excitement is contagious! Tell me about what's got you feeling so energized.",
        lonely: "Loneliness can be painful. Remember that you're not alone - I'm here with you.",
        frustrated: "Frustration is a natural response. Let's explore what's been challenging you.",
        motivated: "I love your motivation! What goals are you working toward right now?",
      } as const;

      const aiText = moodResponses[mood];
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      addMessage.mutate({ message: aiText, is_user: false, mood_context: mood });
    }, 800);
  };

  const handleClearChat = async () => {
    const now = new Date();
    setClearCutoff(now);
    if (cutoffKey) {
      localStorage.setItem(cutoffKey, now.toISOString());
    } else {
      const { data } = await supabase.auth.getUser();
      const key = data.user?.id ? `chatClearCutoff:${data.user.id}` : null;
      if (key) localStorage.setItem(key, now.toISOString());
    }
    try {
      await clearChat.mutateAsync();
    } catch (e) {
    }
    setMessages(initialMessages());
    setInputMessage("");
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex flex-col w-full max-w-6xl rounded-lg h-[640px] overflow-hidden glass-panel">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">AI Therapy Session</h1>
            <p className="text-muted-foreground mt-1">A safe space for your thoughts and feelings</p>
          </div>
          <Button variant="outline" onClick={handleClearChat} className="gap-2">
            <Trash2 className="w-4 h-4" /> Clear chat
          </Button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto space-y-4 chat-interface" style={{ minHeight: 0 }}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bubble bubble-bot">
                <span className="inline-block animate-pulse">Typing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col bg-transparent border-t border-border">
          <div className="composer p-4 items-center gap-x-2">
            <div className="chat-input-card">
              <div className="chat-input-card2">
                <div className="chat-input-group">
                  <input
                    required
                    type="text"
                    id="user-input"
                    className="chat-input-field"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    autoComplete="off"
                    disabled={isGenerating}
                    placeholder=" "
                  />
                  <label htmlFor="user-input" className="chat-input-label">
                    {isGenerating ? 'AI is responding...' : 'Type a message...'}
                  </label>
                </div>
              </div>
            </div>

            <button onClick={handleSendMessage} className="send-fly-button" disabled={isGenerating}>
              <div className="svg-wrapper-1">
                <div className="svg-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path
                      fill="currentColor"
                      d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                    ></path>
                  </svg>
                </div>
              </div>
              <span>{isGenerating ? 'Sending...' : 'Send'}</span>
            </button>
          </div>

          <div className="p-1 border-t border-border flex justify-center items-center">
            <MoodSelector onMoodSelect={handleMoodSelect} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl">
        <div className="card-stack-section" data-aos="fade-up" data-aos-duration="1000">
          {/* Card stack animation */}
          <div className="card-stack-rows">
            {/* Use dedicated component to keep tidy */}
            </div>
        </div>
      </div>
    </div>
  );
};
