"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useSettingsApi } from "../../core";
import { createDefaultFn, QUERY_KEYS } from "../../lib";
import { useAccount } from "../hooks";
import { connectionCardData } from "./data";

export function useConnections() {
  const { connections: actions } = useSettingsApi();
  const { data: account } = useAccount();
  const { data: connections } = useQuery({
    initialData: [],
    queryKey: QUERY_KEYS.connections(account.id),
    queryFn: actions?.getAll ?? createDefaultFn([]),
  });

  const appliedStrategies = connections.reduce<Record<string, boolean>>(
    (acc, conn) => ({ ...acc, [conn.connection.type]: true }),
    {},
  );

  const [isToggle, setIsToggle] = useState(true);
  const displayCards = connectionCardData
    .filter(({ id }) => !(id in appliedStrategies))
    .slice(0, isToggle ? 3 : undefined);

  return {
    connections,
    displayCards,
    isToggle,
    toggle: () => setIsToggle((prev) => !prev),
  };
}
