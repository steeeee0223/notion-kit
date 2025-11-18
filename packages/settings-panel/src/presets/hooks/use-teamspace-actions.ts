"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettings } from "../../core";
import { createDefaultFn, QUERY_KEYS, type Teamspaces } from "../../lib";
import { useAccount, useWorkspace } from "./queries";

export function useTeamspaceActions() {
  const queryClient = useQueryClient();
  const { teamspaces: actions } = useSettings();
  const { data: account } = useAccount();
  const { data: workspace } = useWorkspace();
  const queryKey = QUERY_KEYS.teamspaces(workspace.id);

  const { mutateAsync: create } = useMutation({
    mutationFn: actions?.add ?? createDefaultFn(),
    onSuccess: () => toast.success("Teamspace created"),
    onError: (e) =>
      toast.error("Create teamspace failed", { description: e.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: actions?.update ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (v) => {
        if (!v) return {};
        const teamspace = v[payload.id];
        if (!teamspace) return v;
        return { ...v, [payload.id]: { ...teamspace, ...payload } };
      });
      return { prev };
    },
    onSuccess: () => toast.success("Teamspace updated"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Update teamspace failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (v) => {
        if (!v) return {};
        const updated = { ...v };
        delete updated[payload];
        return updated;
      });
      return { prev };
    },
    onSuccess: () => toast.success("Teamspace deleted"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Delete teamspace failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: leave } = useMutation({
    mutationFn: actions?.leave ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (v) => {
        if (!v) return {};
        const teamspace = v[payload];
        if (!teamspace) return v;
        return {
          ...v,
          [payload]: {
            ...teamspace,
            members: teamspace.members.filter((m) => m.userId !== account.id),
          },
        };
      });
      return { prev };
    },
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Leave teamspace failed", { description: e.message });
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
      const prev = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (v) => {
        if (!v) return {};
        const teamspace = v[payload.teamspaceId];
        if (!teamspace) return v;
        return {
          ...v,
          [payload.teamspaceId]: {
            ...teamspace,
            members: teamspace.members.map((m) => {
              if (m.userId !== payload.userId) return m;
              return { ...m, role: payload.role };
            }),
          },
        };
      });
      return { prev };
    },
    onSuccess: () => toast.success("Teamspace member updated"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Update teamspace member failed", {
        description: e.message,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: removeMember } = useMutation({
    mutationFn: actions?.deleteMember ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Teamspaces>(queryKey);
      queryClient.setQueryData<Teamspaces>(queryKey, (v) => {
        if (!v) return {};
        const teamspace = v[payload.teamspaceId];
        if (!teamspace) return v;
        return {
          ...v,
          [payload.teamspaceId]: {
            ...teamspace,
            members: teamspace.members.filter(
              (m) => m.userId !== payload.userId,
            ),
          },
        };
      });
      return { prev };
    },
    onSuccess: () => toast.success("Teamspace member deleted"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Delete teamspace member failed", {
        description: e.message,
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
