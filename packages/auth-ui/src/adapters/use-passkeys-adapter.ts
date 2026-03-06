"use client";

import { useMemo } from "react";

import type { PasskeysAdapter } from "@notion-kit/settings-panel";

import { useAuth } from "../auth-provider";
import { transferPasskeys } from "./utils";

export function usePasskeysAdapter(): PasskeysAdapter {
  const { auth } = useAuth();

  return useMemo<PasskeysAdapter>(
    () => ({
      getAll: async () => {
        const result = await auth.passkey.listUserPasskeys();
        return transferPasskeys(result.data);
      },
      add: async () => {
        const result = await auth.passkey.addPasskey();
        return !result;
      },
      update: async (data) => {
        await auth.passkey.updatePasskey(data, { throw: true });
      },
      delete: async (id) => {
        await auth.passkey.deletePasskey({ id }, { throw: true });
      },
    }),
    [auth],
  );
}
