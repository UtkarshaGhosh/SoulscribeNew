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
    <div className={cn("flex w-full", message.isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "bubble break-words whitespace-pre-wrap leading-relaxed",
        message.isUser ? "bubble-user" : "bubble-bot"
      )}>
        {message.content}
      </div>
    </div>
  );
};
