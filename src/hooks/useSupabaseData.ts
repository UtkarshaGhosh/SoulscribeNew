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

export function useWellness(lastNDays = 7) {
  return useQuery({ queryKey: ["wellness", lastNDays], queryFn: () => getLastNDaysWellness(lastNDays), staleTime: 60_000 });
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
