"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useModal } from "@notion-kit/modal";
import { toast } from "@notion-kit/shadcn";

import { useSettings } from "../../core";
import {
  createDefaultFn,
  logError,
  QUERY_KEYS,
  type SessionRow,
} from "../../lib";

export function useSessions() {
  const { settings, sessions: actions } = useSettings();
  const { closeModal } = useModal();
  const queryClient = useQueryClient();

  const queryKey = QUERY_KEYS.sessions(settings.account.id);
  const { data: sessions } = useQuery({
    initialData: [],
    queryKey,
    queryFn: actions?.getAll ?? createDefaultFn([]),
    enabled: !!settings.account.currentSessionId,
  });

  const { mutate: revoke } = useMutation({
    mutationKey: queryKey,
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<SessionRow[]>(queryKey);
      queryClient.setQueryData<SessionRow[]>(queryKey, (prev) => {
        if (!prev) return [];
        return prev.filter((session) => session.token !== payload);
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("Session logged out successfully");
      closeModal();
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      logError("Revoke session failed", error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutate: revokeOthers } = useMutation({
    mutationKey: queryKey,
    mutationFn: actions?.deleteAll ?? createDefaultFn(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<SessionRow[]>(queryKey);
      queryClient.setQueryData<SessionRow[]>(queryKey, (prev) => {
        if (!prev) return [];
        return prev.filter(
          (session) => session.token === settings.account.currentSessionId,
        );
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success("All sessions logged out successfully");
      closeModal();
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      logError("Revoke sessions failed", error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { sessions, revoke, revokeOthers };
}
