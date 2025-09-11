import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Constants, Enums } from "@/integrations/supabase/types";
import { useMoodCountsAllTime } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles } from "lucide-react";

const MOOD_ADVICE: Record<Enums<'mood_type'>, string> = {
  happy: "Keep reinforcing what works: note your gratitude and share moments with someone you care about.",
  sad: "Be gentle with yourself. Try a short walk, a warm beverage, and reach out to a trusted person.",
  angry: "Pause and reset. Practice box-breathing (4-4-4-4) and consider a brief physical activity to release tension.",
  anxious: "Try a grounding technique (5-4-3-2-1), reduce caffeine, and schedule a small, achievable task.",
  calm: "Protect the routines that bring calm—deep work blocks, mindful breaks, and consistent sleep.",
  stressed: "Prioritize the top 1–2 tasks, take micro-breaks, and delegate or defer non-essentials.",
  excited: "Channel the energy: capture ideas, pick one next action, and timebox a sprint to start.",
  lonely: "Plan a social check-in, join a community or call a friend. Small connections matter.",
  frustrated: "Break the blocker into smaller steps, reframe constraints, and celebrate small wins.",
  motivated: "Leverage momentum—define a clear next step, set a timer, and protect the time to execute.",
};

export function InsightsTab() {
  const { data: counts = [], refetch } = useMoodCountsAllTime();

  useEffect(() => {
    const channel = supabase
      .channel('public:mood_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mood_entries' }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [refetch]);

  const allMoods = Constants.public.Enums.mood_type as Enums<'mood_type'>[];
  const byMood: Record<Enums<'mood_type'>, number> = useMemo(() => {
    const map: Record<Enums<'mood_type'>, number> = Object.fromEntries(allMoods.map(m => [m, 0])) as Record<Enums<'mood_type'>, number>;
    counts.forEach(({ mood, count }: { mood: Enums<'mood_type'>; count: number }) => {
      map[mood] = (map[mood] ?? 0) + count;
    });
    return map;
  }, [counts, allMoods]);

  const { topMood, topCount } = useMemo(() => {
    let best: Enums<'mood_type'> | null = null;
    let bestCount = -1;
    for (const m of allMoods) {
      if (byMood[m] > bestCount) { best = m; bestCount = byMood[m]; }
    }
    return { topMood: best, topCount: bestCount } as { topMood: Enums<'mood_type'> | null; topCount: number };
  }, [byMood, allMoods]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Brain className="w-7 h-7 text-primary"/> Insights</h1>
        <p className="text-muted-foreground">Your mood patterns and personalized guidance</p>
      </div>

      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Mood Log Counts</CardTitle>
          <CardDescription>Number of times you've logged each mood</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {allMoods.map((mood) => (
              <div key={mood} className="rounded-md border border-border/60 bg-card/60 p-3 flex items-center justify-between">
                <span className="capitalize text-sm text-foreground">{mood}</span>
                <Badge variant="outline" className="text-xs">{byMood[mood]}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent"/> Personalized Insight</CardTitle>
          <CardDescription>{topMood ? `Most frequent mood: ${topMood} (${topCount})` : "No mood entries yet"}</CardDescription>
        </CardHeader>
        <CardContent>
          {topMood ? (
            <p className="text-sm text-foreground leading-6">{MOOD_ADVICE[topMood]}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Start logging your mood to see tailored tips and trends.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
