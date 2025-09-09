import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, upsertMyProfile } from "@/integrations/supabase/repositories/profiles";
import { addMoodEntry, listMoodEntriesLastNDays, getMoodDistributionForDate } from "@/integrations/supabase/repositories/moodEntries";
import { addChatMessage, listChatMessages } from "@/integrations/supabase/repositories/chatMessages";
import { upsertWellnessMetric, getLastNDaysWellness } from "@/integrations/supabase/repositories/wellnessMetrics";
import type { Enums } from "@/integrations/supabase/types";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: getMyProfile, staleTime: 60_000 });
}

export function useUpsertProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertMyProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useMoodEntries(days = 7) {
  return useQuery({ queryKey: ["mood_entries", days], queryFn: () => listMoodEntriesLastNDays(days), staleTime: 30_000 });
}

export function useAddMoodEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mood, notes, energy }: { mood: Enums<'mood_type'>; notes?: string; energy?: number }) => addMoodEntry(mood, notes, energy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mood_entries"] });
      qc.invalidateQueries({ queryKey: ["mood_distribution"] });
    },
  });
}

export function useMoodDistribution(dateISO: string) {
  return useQuery({ queryKey: ["mood_distribution", dateISO], queryFn: () => getMoodDistributionForDate(dateISO), staleTime: 30_000 });
}

export function useChatMessages() {
  return useQuery({ queryKey: ["chat_messages"], queryFn: () => listChatMessages(), staleTime: 5_000 });
}

export function useAddChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, is_user, mood_context }: { message: string; is_user: boolean; mood_context?: Enums<'mood_type'> }) =>
      addChatMessage(message, is_user, mood_context),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat_messages"] });
    },
  });
}

const MOOD_WELLBEING: Record<string, number> = {
  happy: 9,
  calm: 7,
  excited: 8,
  motivated: 8,
  anxious: 4,
  stressed: 3,
  angry: 2,
  frustrated: 3,
  sad: 3,
  lonely: 3,
};
const MOOD_ENERGY: Record<string, number> = {
  excited: 8,
  happy: 7,
  motivated: 7,
  calm: 5,
  anxious: 4,
  stressed: 3,
  angry: 4,
  frustrated: 3,
  sad: 3,
  lonely: 2,
};

function dateKey(d: Date) { return d.toISOString().slice(0,10); }

export function useWellness(lastNDays = 7) {
  return useQuery({
    queryKey: ["wellness", lastNDays],
    staleTime: 60_000,
    queryFn: async () => {
      const [db, moods] = await Promise.all([
        getLastNDaysWellness(lastNDays),
        listMoodEntriesLastNDays(lastNDays),
      ]);
      const byDateMoods = new Map<string, typeof moods>();
      for (let i = 0; i < lastNDays; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (lastNDays - 1 - i));
        byDateMoods.set(dateKey(d), []);
      }
      moods.forEach(m => {
        const k = m.created_at.slice(0,10);
        if (byDateMoods.has(k)) byDateMoods.get(k)!.push(m);
      });

      const dbByDate = new Map(db.map(w => [w.date, w] as const));
      const result = Array.from(byDateMoods.keys()).map(date => {
        const fromDb = dbByDate.get(date);
        if (fromDb && fromDb.wellbeing_score != null && fromDb.energy_level != null && fromDb.resilience_score != null) return fromDb;
        const items = byDateMoods.get(date)!;
        if (!items.length) return fromDb ?? { date, wellbeing_score: 0, energy_level: 0, resilience_score: 0, productivity_score: 0, emotional_volatility: 0, id: "derived-"+date, user_id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any;
        const ws: number[] = [];
        const es: number[] = [];
        items.forEach(r => {
          const w = MOOD_WELLBEING[String(r.mood)] ?? 5;
          ws.push(w);
          const e = (r.energy_level ?? MOOD_ENERGY[String(r.mood)] ?? 5);
          es.push(e);
        });
        const avg = (arr: number[]) => arr.reduce((a,b)=>a+b,0)/arr.length;
        const meanW = avg(ws);
        const meanE = avg(es);
        const variance = ws.reduce((a,b)=>a+Math.pow(b-meanW,2),0)/ws.length;
        const std = Math.sqrt(variance);
        const resilience = Math.max(0, Math.min(10, 10 - std));
        return {
          id: `derived-${date}`,
          user_id: "",
          date,
          wellbeing_score: Number(meanW.toFixed(1)),
          energy_level: Number(meanE.toFixed(1)),
          resilience_score: Number(resilience.toFixed(1)),
          productivity_score: 0,
          emotional_volatility: Number(std.toFixed(1)),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any;
      });
      return result;
    }
  });
}

export function useUpsertWellness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertWellnessMetric,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wellness"] });
    },
  });
}
