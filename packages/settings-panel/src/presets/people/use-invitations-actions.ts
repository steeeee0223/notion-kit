"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettings } from "../../core";
import { createDefaultFn, InvitationRow, QUERY_KEYS } from "../../lib";

export function useInvitationsActions() {
  const queryClient = useQueryClient();
  const { settings, invitations: actions } = useSettings();
  const queryKey = QUERY_KEYS.invitations(settings.workspace.id);

  const { mutateAsync: invite } = useMutation({
    mutationFn: actions?.add ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<InvitationRow[]>(queryKey);
      queryClient.setQueryData<InvitationRow[]>(queryKey, (prev) => {
        if (!prev) return [];
        return [
          ...prev,
          ...payload.emails.map<InvitationRow>((email) => ({
            id: `invite-${email}`,
            email,
            role: payload.role,
            status: "pending",
            invitedBy: settings.account,
          })),
        ];
      });
      return { previous };
    },
    onSuccess: () => toast.success("Member invited"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Invite member failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: cancel } = useMutation({
    mutationFn: actions?.cancel ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<InvitationRow[]>(queryKey);
      queryClient.setQueryData<InvitationRow[]>(queryKey, (prev) => {
        if (!prev) return [];
        return prev.filter((invitation) => invitation.id !== payload);
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

  return { invite, cancel };
}
