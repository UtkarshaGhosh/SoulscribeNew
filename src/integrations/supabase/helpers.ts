import { supabase } from "./client";

export async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error("Not authenticated");
  return uid;
}
