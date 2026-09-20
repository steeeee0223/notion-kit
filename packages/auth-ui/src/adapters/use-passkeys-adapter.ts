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
        if (result.error) throw new Error(result.error.message);
        return transferPasskeys(result.data);
      },
      add: async () => {
        const result = await auth.passkey.addPasskey();
        if (result.error) {
          if (
            "code" in result.error &&
            result.error.code === "ERROR_CEREMONY_ABORTED"
          )
            return false;
          throw new Error(result.error.message);
        }
        return Boolean(result.data);
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
