import { cn } from "@/lib/utils";
import type { Mood } from "./ChatInterface";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  mood?: Mood;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex w-full",
      message.isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 shadow-soft",
        message.isUser 
          ? "bg-gradient-primary text-primary-foreground ml-12" 
          : "bg-card text-card-foreground mr-12"
      )}>
        {message.mood && (
          <div className="text-xs opacity-75 mb-1 font-medium">
            Mood: {message.mood}
          </div>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={cn(
          "text-xs mt-2 opacity-60",
          message.isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};