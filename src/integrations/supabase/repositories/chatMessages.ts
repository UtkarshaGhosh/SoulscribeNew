import { supabase } from "../client";
import type { Tables, TablesInsert } from "../types";
import { requireUserId } from "../helpers";

export async function addChatMessage(message: string, is_user: boolean, mood_context?: Tables<'chat_messages'>['mood_context']) {
  const user_id = await requireUserId();
  const payload: TablesInsert<'chat_messages'> = { user_id, message, is_user, mood_context: mood_context ?? null };
  const { data, error } = await supabase
    .from("chat_messages")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Tables<'chat_messages'>;
}

export async function listChatMessages(limit = 100) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data as Tables<'chat_messages'>[];
}
