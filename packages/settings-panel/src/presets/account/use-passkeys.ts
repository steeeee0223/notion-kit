"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettingsApi } from "../../core";
import { createDefaultFn, logError, QUERY_KEYS, type Passkey } from "../../lib";
import { useAccount } from "../hooks";

export function usePasskeys() {
  const { passkeys: actions } = useSettingsApi();
  const { data: account } = useAccount();
  const queryClient = useQueryClient();

  const queryKey = QUERY_KEYS.passkeys(account.id);
  const { data: passkeys } = useQuery({
    initialData: [],
    queryKey,
    queryFn: actions?.getAll ?? createDefaultFn([]),
  });

  const [error, setError] = useState(false);

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationKey: queryKey,
    mutationFn: actions?.add ?? createDefaultFn(true),
    onSuccess: async (ok) => {
      setError(!ok);
      if (ok) {
        toast.success("Passkey created successfully");
        await queryClient.invalidateQueries({ queryKey });
        return;
      }
      logError("Create passkey failed", { message: "Unexpected error" });
    },
    onError: (error) => logError("Create passkey failed", error),
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationKey: queryKey,
    mutationFn: actions?.update ?? createDefaultFn(),
    onMutate: async (payload) => {
      setError(false);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Passkey[]>(queryKey);
      queryClient.setQueryData<Passkey[]>(queryKey, (prev) => {
        if (!prev) return [];
        return prev.map((passkey) => {
          if (passkey.id !== payload.id) return passkey;
          return { ...passkey, name: payload.name };
        });
      });
      return { previous };
    },
    onSuccess: () => toast.success("Passkey updated successfully"),
    onError: (error, _, context) => {
      setError(true);
      queryClient.setQueryData(queryKey, context?.previous);
      logError("Update passkey failed", error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationKey: queryKey,
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      setError(false);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Passkey[]>(queryKey);
      queryClient.setQueryData<Passkey[]>(queryKey, (prev) => {
        if (!prev) return [];
        return prev.filter((passkey) => passkey.id !== payload);
      });
      return { previous };
    },
    onSuccess: () => toast.success("Passkey deleted successfully"),
    onError: (error, _, context) => {
      setError(true);
      queryClient.setQueryData(queryKey, context?.previous);
      logError("Delete passkey failed", error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    passkeys,
    error,
    isPending: isCreating || isUpdating || isRemoving,
    create,
    update,
    remove,
    clearError: () => setError(false),
  };
}
