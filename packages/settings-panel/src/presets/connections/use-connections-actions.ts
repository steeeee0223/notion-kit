"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettingsApi } from "../../core";
import { createDefaultFn, QUERY_KEYS, type Connection } from "../../lib";
import { useAccount } from "../hooks";

export function useConnectionsActions() {
  const queryClient = useQueryClient();
  const { connections: actions } = useSettingsApi();
  const { data: account } = useAccount();
  const queryKey = QUERY_KEYS.connections(account.id);

  const { mutateAsync: connect, isPending: isConnecting } = useMutation({
    mutationFn: actions?.add ?? createDefaultFn(),
    onSuccess: async (_, payload) => {
      toast.success(`Connected ${payload} successfully`);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (e, payload) =>
      toast.error(`Connect ${payload} failed`, { description: e.message }),
  });

  const { mutate: unlink } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Connection[]>(queryKey);
      queryClient.setQueryData<Connection[]>(queryKey, (v) => {
        if (!v) return [];
        return v.filter((conn) => conn.id !== payload.id);
      });
      return { prev };
    },
    onSuccess: () => toast.success("Connection unlink successfully"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Unlink connection failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { isConnecting, connect, unlink };
}
