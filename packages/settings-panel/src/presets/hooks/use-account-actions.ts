"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";

import { toast } from "@notion-kit/shadcn";

import {
  createDefaultFn,
  LOCALSTORAGE_KEYS,
  QUERY_KEYS,
  useSettings,
  type AccountStore,
} from "../..";
import { initialAccountStore } from "./constants";
import { useAccount } from "./queries";

export function useAccountActions() {
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const { settings, account: actions } = useSettings();
  const queryKey = QUERY_KEYS.account(settings.account.id);

  /** Localstorage */
  const [locale, setLocale] = useLocalStorage(
    LOCALSTORAGE_KEYS.locale,
    account.language ?? "en",
  );
  const [timezone, setTimezone] = useLocalStorage(
    LOCALSTORAGE_KEYS.timezone,
    account.timezone,
  );

  const { mutateAsync: update } = useMutation({
    mutationFn: actions?.update ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<AccountStore>(queryKey, (v) => {
        if (!v) return v;
        return { ...v, ...payload };
      });
      if (payload.language) {
        setLocale(payload.language);
      }
      if (payload.timezone) {
        setTimezone(payload.timezone);
      }
      return { prev };
    },
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Update account failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, initialAccountStore);
      return { prev };
    },
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Delete account failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: sendEmailVerification } = useMutation({
    mutationFn: actions?.sendEmailVerification ?? createDefaultFn(),
    onError: (e) =>
      toast.error("Send email verification failed", {
        description: e.message,
      }),
  });

  const { mutateAsync: changePassword } = useMutation({
    mutationFn: actions?.changePassword ?? createDefaultFn(),
    onError: (e) =>
      toast.error("Change password failed", { description: e.message }),
  });

  const { mutateAsync: setPassword } = useMutation({
    mutationFn: actions?.setPassword ?? createDefaultFn(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<AccountStore>(queryKey, (v) => {
        if (!v) return v;
        return { ...v, hasPassword: true };
      });
      return { prev };
    },
    onSuccess: () => toast.success("Password set successfully"),
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Set password failed", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    locale,
    timezone,
    update,
    remove,
    sendEmailVerification,
    changePassword,
    setPassword,
  };
}
