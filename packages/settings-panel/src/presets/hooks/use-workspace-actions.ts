"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { IconData } from "@notion-kit/schemas";
import { toast } from "@notion-kit/ui/primitives";

import { useSettingsApi } from "@/core";
import { QUERY_KEYS, unsupportedOperation } from "@/lib/queries";
import type { WorkspaceStore } from "@/lib/types";

import { initialWorkspaceStore } from "./constants";

export function useWorkspaceActions() {
  const queryClient = useQueryClient();
  const { workspace: actions } = useSettingsApi();
  const queryKey = QUERY_KEYS.workspace(initialWorkspaceStore.id);

  const { mutateAsync: update } = useMutation({
    mutationFn: actions?.update ?? unsupportedOperation,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<WorkspaceStore>(queryKey, (v) => {
        if (!v) return v;
        return { ...v, ...payload };
      });
      return { prev };
    },
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Update workspace failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: updateIcon, isPending: isUpdatingIcon } = useMutation({
    mutationFn: (icon: IconData) => {
      if (!actions?.update) return unsupportedOperation();
      return actions.update({ icon });
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<WorkspaceStore>(queryKey, (v) => {
        if (!v) return v;
        return { ...v, icon: payload };
      });
      return { prev };
    },
    onError: (_e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: actions?.delete ?? unsupportedOperation,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, initialWorkspaceStore);
      return { prev };
    },
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Delete workspace failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: leave } = useMutation({
    mutationFn: actions?.leave ?? unsupportedOperation,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, initialWorkspaceStore);
      return { prev };
    },
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Leave workspace failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: resetLink, isPending: isResettingLink } = useMutation({
    mutationFn: actions?.resetLink ?? unsupportedOperation,
    onSuccess: () => toast.success("Workspace link updated"),
    onError: (error) => {
      toast.error("Update workspace link failed", {
        description: error.message,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    isUpdatingIcon,
    isResettingLink,
    update,
    updateIcon,
    remove,
    leave,
    resetLink,
  };
}
