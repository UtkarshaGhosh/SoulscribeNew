import { supabase } from "../client";
import type { Tables, TablesInsert } from "../types";
import { getCurrentUserId, requireUserId } from "../helpers";

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
  try {
    const user_id = await getCurrentUserId();
    if (!user_id) return [] as Tables<'chat_messages'>[];

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) {
      // If unauthorized, return empty list instead of throwing so UI doesn't spam 401s
      if ((error as any)?.status === 401) return [] as Tables<'chat_messages'>[];
      throw error;
    }
    return data as Tables<'chat_messages'>[];
  } catch (err) {
    // On any error, return empty list to avoid repeated unauthenticated requests from the client
    return [] as Tables<'chat_messages'>[];
  }
}
