import type { Mood } from "@/components/chat/ChatInterface";

export const moodToThemeClass: Record<Mood, string> = {
  happy: "theme-happy",
  sad: "theme-muted",
  angry: "theme-angry",
  anxious: "theme-anxious",
  calm: "theme-calm",
  stressed: "theme-stressed",
  excited: "theme-energized",
  lonely: "theme-neutral",
  frustrated: "theme-frustrated",
  motivated: "theme-grounding",
};

export function applyThemeForMood(mood: Mood | null) {
  if (typeof document === "undefined") return;
  const body = document.body;
  // Remove prior theme-/mood- classes
  Array.from(body.classList)
    .filter((c) => c.startsWith("theme-") || c.startsWith("mood-"))
    .forEach((c) => body.classList.remove(c));
  if (mood) {
    const theme = moodToThemeClass[mood];
    if (theme) body.classList.add(theme);
  }
}
