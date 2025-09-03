"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettings } from "../../core";
import { createDefaultFn, QUERY_KEYS, type Teamspaces } from "../../lib";

export function useTeamspaceActions() {
  const queryClient = useQueryClient();
  const { settings, teamspaces: actions } = useSettings();
  const queryKey = QUERY_KEYS.teamspaces(settings.workspace.id);

  const { mutateAsync: create } = useMutation({
    mutationFn: actions?.add ?? createDefaultFn(),
    onSuccess: () => toast.success("Teamspace created"),
    onError: (error) =>
      toast.error("Create teamspace failed", { description: error.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: actions?.update ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (prev) => {
        if (!prev) return {};
        const { [payload.id]: teamspace, ...rest } = prev;
        if (!teamspace) return prev;
        return { ...rest, [payload.id]: { ...teamspace, ...payload } };
      });
      return { previous };
    },
    onSuccess: () => toast.success("Teamspace updated"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Update teamspace failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (prev) => {
        if (!prev) return {};
        const { [payload]: _, ...rest } = prev;
        return rest;
      });
      return { previous };
    },
    onSuccess: () => toast.success("Teamspace deleted"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Delete teamspace failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: leave } = useMutation({
    mutationFn: actions?.leave ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (prev) => {
        if (!prev) return {};
        const { [payload]: teamspace, ...rest } = prev;
        if (!teamspace) return prev;
        return {
          ...rest,
          [payload]: {
            ...teamspace,
            members: teamspace.members.filter(
              (m) => m.userId !== settings.account.id,
            ),
          },
        };
      });
      return { previous };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Leave teamspace failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: addMembers } = useMutation({
    mutationFn: actions?.addMembers ?? createDefaultFn(),
    onSuccess: () => toast.success("Teamspace members added"),
    onError: (error) =>
      toast.error("Add teamspace members failed", {
        description: error.message,
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: updateMember } = useMutation({
    mutationFn: actions?.updateMember ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (prev) => {
        if (!prev) return {};
        const { [payload.teamspaceId]: teamspace, ...rest } = prev;
        if (!teamspace) return prev;
        return {
          ...rest,
          [payload.teamspaceId]: {
            ...teamspace,
            members: teamspace.members.map((m) => {
              if (m.userId !== payload.userId) return m;
              return { ...m, role: payload.role };
            }),
          },
        };
      });
      return { previous };
    },
    onSuccess: () => toast.success("Teamspace member updated"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Update teamspace member failed", {
        description: error.message,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: removeMember } = useMutation({
    mutationFn: actions?.deleteMember ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (prev) => {
        if (!prev) return {};
        const { [payload.teamspaceId]: teamspace, ...rest } = prev;
        if (!teamspace) return prev;
        return {
          ...rest,
          [payload.teamspaceId]: {
            ...teamspace,
            members: teamspace.members.filter(
              (m) => m.userId !== payload.userId,
            ),
          },
        };
      });
      return { previous };
    },
    onSuccess: () => toast.success("Teamspace member deleted"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Delete teamspace member failed", {
        description: error.message,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    create,
    update,
    remove,
    leave,
    addMembers,
    updateMember,
    removeMember,
  };
}
