import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettingsApi } from "@/core";
import { createDefaultFn, QUERY_KEYS, type Emojis } from "@/lib";
import { useWorkspace } from "@/presets/hooks";

export function useEmojiActions() {
  const queryClient = useQueryClient();
  const { emoji: actions } = useSettingsApi();
  const { data: workspace } = useWorkspace();
  const queryKey = QUERY_KEYS.emoji(workspace.id);

  const { mutateAsync: add } = useMutation({
    mutationFn: actions?.add ?? createDefaultFn(),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
    onSuccess: () => toast.success("Emoji added"),
    onError: (e) => toast.error("Add emoji failed", { description: e.message }),
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: actions?.update ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Emojis>(queryKey);
      queryClient.setQueryData<Emojis>(queryKey, (v) => {
        if (!v) return {};
        const emoji = v[payload.id];
        if (!emoji) return v;
        return {
          ...v,
          [payload.id]: {
            ...emoji,
            ...(payload.name !== undefined && { name: payload.name }),
          },
        };
      });
      return { prev };
    },
    onSuccess: () => toast.success("Emoji updated"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Update emoji failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Emojis>(queryKey);
      queryClient.setQueryData<Emojis>(queryKey, (v) => {
        if (!v) return {};
        const updated = { ...v };
        delete updated[id];
        return updated;
      });
      return { prev };
    },
    onSuccess: () => toast.success("Emoji deleted"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Delete emoji failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { add, update, remove };
}
