import { supabase } from "../client";
import type { Tables, TablesInsert, Enums } from "../types";
import { requireUserId } from "../helpers";

export async function addMoodEntry(mood: Enums<'mood_type'>, notes?: string, energy_level?: number) {
  const user_id = await requireUserId();
  const payload: TablesInsert<'mood_entries'> = { user_id, mood, notes: notes ?? null, energy_level: energy_level ?? null };
  const { data, error } = await supabase
    .from("mood_entries")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Tables<'mood_entries'>;
}

export async function listMoodEntriesLastNDays(days: number) {
  const user_id = await requireUserId();
  const from = new Date();
  from.setDate(from.getDate() - days);
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user_id)
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Tables<'mood_entries'>[];
}

export async function getMoodDistributionForDate(dateISO: string) {
  const user_id = await requireUserId();
  const start = new Date(dateISO);
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  const { data, error } = await supabase
    .from("mood_entries")
    .select("mood")
    .eq("user_id", user_id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());
  if (error) throw error;
  const counts = new Map<Enums<'mood_type'>, number>();
  data.forEach(r => counts.set(r.mood as Enums<'mood_type'>, (counts.get(r.mood as Enums<'mood_type'>) ?? 0) + 1));
  return Array.from(counts.entries()).map(([mood, count]) => ({ mood, count }));
}

export async function getMoodCountsAllTime() {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from("mood_entries")
    .select("mood")
    .eq("user_id", user_id);
  if (error) throw error;
  const counts = new Map<Enums<'mood_type'>, number>();
  data.forEach(r => counts.set(r.mood as Enums<'mood_type'>, (counts.get(r.mood as Enums<'mood_type'>) ?? 0) + 1));
  return Array.from(counts.entries()).map(([mood, count]) => ({ mood, count }));
}
