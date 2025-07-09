"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useSettings } from "../../core";
import { createDefaultFn, QUERY_KEYS } from "../../lib";
import { connectionCardData } from "./data";

export function useConnections() {
  const { settings, connections: actions } = useSettings();
  const { data: connections } = useQuery({
    initialData: [],
    queryKey: QUERY_KEYS.connections(settings.account.id),
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
