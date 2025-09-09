import { supabase } from "../client";
import type { Tables, TablesInsert, TablesUpdate } from "../types";
import { requireUserId } from "../helpers";

export async function getMyProfile() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data as Tables<'profiles'>;
}

export async function upsertMyProfile(update: Partial<TablesUpdate<'profiles'>> & { display_name?: string | null; avatar_url?: string | null; timezone?: string | null; }) {
  const userId = await requireUserId();
  const payload: TablesInsert<'profiles'> = {
    user_id: userId,
    display_name: update.display_name ?? null,
    avatar_url: update.avatar_url ?? null,
    timezone: update.timezone ?? undefined,
  };
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Tables<'profiles'>;
}
