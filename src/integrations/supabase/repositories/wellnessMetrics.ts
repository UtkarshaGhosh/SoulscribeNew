import { supabase } from "../client";
import type { Tables, TablesInsert } from "../types";
import { requireUserId } from "../helpers";

export async function upsertWellnessMetric(input: Omit<TablesInsert<'wellness_metrics'>, 'user_id'>) {
  const user_id = await requireUserId();
  const payload: TablesInsert<'wellness_metrics'> = { ...input, user_id };
  const { data, error } = await supabase
    .from("wellness_metrics")
    .upsert(payload, { onConflict: "user_id,date" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Tables<'wellness_metrics'>;
}

export async function listWellnessMetrics(fromISO?: string, toISO?: string) {
  const user_id = await requireUserId();
  let query = supabase
    .from("wellness_metrics")
    .select("*")
    .eq("user_id", user_id)
    .order("date", { ascending: true });
  if (fromISO) query = query.gte("date", fromISO);
  if (toISO) query = query.lte("date", toISO);
  const { data, error } = await query;
  if (error) throw error;
  return data as Tables<'wellness_metrics'>[];
}

export async function getLastNDaysWellness(n: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  return listWellnessMetrics(from, to);
}
