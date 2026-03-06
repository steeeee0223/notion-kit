"use client";

import { useMemo } from "react";

import type { ConnectionsAdapter } from "@notion-kit/settings-panel";

import { useAuth } from "../auth-provider";
import { deleteConnection, linkAccount, loadConnections } from "./utils";

export function useConnectionsAdapter(): ConnectionsAdapter {
  const { auth } = useAuth();

  return useMemo<ConnectionsAdapter>(
    () => ({
      getAll: () => loadConnections(auth),
      add: (strategy) => linkAccount(auth, strategy),
      delete: (connection) => deleteConnection(auth, connection),
    }),
    [auth],
  );
}
