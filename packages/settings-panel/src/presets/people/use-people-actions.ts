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
      const prev = queryClient.getQueryData<Memberships>(queryKey);
      queryClient.setQueryData<Memberships>(queryKey, (v) => {
        if (!v) return {};
        const member = v[payload.id];
        if (!member) return v;
        const updated = { ...v };
        updated[payload.id] = { ...member, role: payload.role };
        return updated;
      });
      return { prev };
    },
    onSuccess: () => toast.success("Member updated"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Update member failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Memberships>(queryKey);
      queryClient.setQueryData<Memberships>(queryKey, (v) => {
        if (!v) return {};
        const updated = { ...v };
        delete updated[payload.id];
        return updated;
      });
      return { prev };
    },
    onSuccess: () => toast.success("Member removed"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Remove member failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { update, remove };
}
