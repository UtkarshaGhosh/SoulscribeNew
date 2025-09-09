import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { MoodSelector } from "./MoodSelector";
import { ChatMessage } from "./ChatMessage";
import { useAddChatMessage, useChatMessages, useAddMoodEntry } from "@/hooks/useSupabaseData";

import { useEffect, useState } from "react";
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

export const ChatInterface = ({ onMoodChange }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const { data: history } = useChatMessages();
  const addMessage = useAddChatMessage();
  const addMood = useAddMoodEntry();

  useEffect(() => {
    if (history && history.length > 0) {
      setMessages(
        history.map((m) => ({
          id: m.id,
          content: m.message,
          isUser: m.is_user,
          mood: m.mood_context ?? undefined,
          timestamp: new Date(m.created_at),
        }))
      );
    } else {
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm your AI Therapist. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [history]);

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

      // Read body once as text and parse to avoid 'body stream already read' errors
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

    // build history for AI
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

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">AI Therapy Session</h1>
        <p className="text-muted-foreground mt-1">A safe space for your thoughts and feelings</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      {/* Mood Selector */}
      <div className="p-4 border-t border-border">
        <MoodSelector onMoodSelect={handleMoodSelect} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border">
        <div className="flex gap-3 items-end">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isGenerating}
            className="bg-input border-border focus:border-primary focus:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-primary hover:shadow-glow transition-smooth"
            disabled={isGenerating}
          >
            {isGenerating ? '...' : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {isGenerating && <div className="text-sm text-muted-foreground mt-2">Assistant is typing...</div>}
      </div>
    </div>
  );
};
