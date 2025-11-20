"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettingsApi } from "../../core";
import { createDefaultFn, QUERY_KEYS, type Invitations } from "../../lib";
import { useWorkspace } from "../hooks";

export function useInvitationsActions() {
  const queryClient = useQueryClient();
  const { invitations: actions } = useSettingsApi();
  const { data: workspace } = useWorkspace();
  const queryKey = QUERY_KEYS.invitations(workspace.id);

  const { mutateAsync: invite } = useMutation({
    mutationFn: actions?.add ?? createDefaultFn(),
    onSuccess: () => toast.success("Member invited"),
    onError: (error) =>
      toast.error("Invite member failed", { description: error.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: cancel } = useMutation({
    mutationFn: actions?.cancel ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Invitations>(queryKey);
      queryClient.setQueryData<Invitations>(queryKey, (prev) => {
        if (!prev) return {};
        return {
          ...prev,
          [payload]: { ...prev[payload]!, status: "canceled" },
        };
      });
      return { previous };
    },
    onSuccess: () => toast.success("Invitation canceled"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Cancel invitation failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { invite, cancel };
}
