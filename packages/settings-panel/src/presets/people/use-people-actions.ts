"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettings } from "../../core";
import { createDefaultFn, Memberships, QUERY_KEYS } from "../../lib";

export function usePeopleActions() {
  const queryClient = useQueryClient();
  const { settings, people: actions } = useSettings();
  const queryKey = QUERY_KEYS.members(settings.workspace.id);

  const { mutateAsync: update } = useMutation({
    mutationFn: actions?.update ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Memberships>(queryKey);
      queryClient.setQueryData<Memberships>(queryKey, (prev) => {
        if (!prev) return {};
        const { [payload.id]: member, ...rest } = prev;
        if (!member) return prev;
        return { ...rest, [payload.id]: { ...member, role: payload.role } };
      });
      return { previous };
    },
    onSuccess: () => toast.success("Member updated"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Update member failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Memberships>(queryKey);
      queryClient.setQueryData<Memberships>(queryKey, (prev) => {
        if (!prev) return {};
        const { [payload]: _, ...rest } = prev;
        return rest;
      });
      return { previous };
    },
    onSuccess: () => toast.success("Member removed"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Remove member failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { update, remove };
}
