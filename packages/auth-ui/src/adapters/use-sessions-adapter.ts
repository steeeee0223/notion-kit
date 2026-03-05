"use client";

import { useMemo } from "react";

import type { SessionsAdapter } from "@notion-kit/settings-panel";

import { useAuth } from "../auth-provider";
import { handleError } from "../lib";
import { transferSessions } from "./utils";

export function useSessionsAdapter(): SessionsAdapter {
  const { auth } = useAuth();

  return useMemo<SessionsAdapter>(
    () => ({
      getAll: async () => {
        const result = await auth.listSessions();
        if (result.error) {
          handleError(result, "Fetch sessions error");
          return [];
        }
        return transferSessions(result.data);
      },
      delete: async (token) => {
        await auth.revokeSession({ token }, { throw: true });
      },
      deleteAll: async () => {
        await auth.revokeOtherSessions(undefined, { throw: true });
      },
    }),
    [auth],
  );
}
