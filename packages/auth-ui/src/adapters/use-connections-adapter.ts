"use client";

import { useMemo } from "react";

import type { ConnectionsAdapter } from "@notion-kit/settings-panel";

import { useAuth } from "../auth-provider";
import { resolveAppURL } from "../lib/app-url";
import { deleteConnection, linkAccount, loadConnections } from "./utils";

export function useConnectionsAdapter(): ConnectionsAdapter {
  const { auth, appURL } = useAuth();

  return useMemo<ConnectionsAdapter>(
    () => ({
      getAll: () => loadConnections(auth),
      add: (strategy) =>
        linkAccount(
          auth,
          strategy,
          resolveAppURL(appURL, window.location.pathname),
        ),
      delete: (connection) => deleteConnection(auth, connection),
    }),
    [auth, appURL],
  );
}
