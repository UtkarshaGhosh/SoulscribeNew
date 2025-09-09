import { useState } from "react";
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    addMessage.mutate({ message: inputMessage, is_user: true });
    setInputMessage("");

    setTimeout(() => {
      const responses = [
        "I understand how you're feeling. Can you tell me more about what's been on your mind?",
        "Thank you for sharing that with me. It sounds like you're dealing with a lot right now.",
        "Those feelings are completely valid. Have you tried any breathing exercises when you feel this way?",
        "It's great that you're reaching out. Remember, taking care of your mental health is a sign of strength.",
        "I hear you. Sometimes it can help to journal about these thoughts. Would you like me to suggest some prompts?",
      ];

      const aiText = responses[Math.floor(Math.random() * responses.length)];
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      addMessage.mutate({ message: aiText, is_user: false });
    }, 800);
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
        <div className="flex gap-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="bg-input border-border focus:border-primary focus:ring-primary"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-primary hover:shadow-glow transition-smooth"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
