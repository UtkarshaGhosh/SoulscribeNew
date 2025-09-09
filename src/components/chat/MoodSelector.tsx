import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Mood } from "./ChatInterface";

interface MoodSelectorProps {
  onMoodSelect: (mood: Mood) => void;
}

const moods: Array<{ id: Mood; label: string; emoji: string }> = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "excited", label: "Excited", emoji: "🤩" },
  { id: "motivated", label: "Motivated", emoji: "💪" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "angry", label: "Angry", emoji: "😠" },
  { id: "frustrated", label: "Frustrated", emoji: "😤" },
  { id: "stressed", label: "Stressed", emoji: "😫" },
  { id: "lonely", label: "Lonely", emoji: "😔" },
];

export const MoodSelector = ({ onMoodSelect }: MoodSelectorProps) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">How are you feeling right now?</p>
      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.id}
            variant="outline"
            size="sm"
            onClick={() => onMoodSelect(mood.id)}
            className={cn(
              "h-auto py-3 px-2 flex flex-col gap-1 transition-smooth",
              "hover:border-primary hover:shadow-soft hover:bg-card",
              "focus:border-primary focus:shadow-glow"
            )}
          >
            <span className="text-lg">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};