"use client";

import { useEffect, useState } from "react";

import type { Connection } from "../../lib";
import { connectionCardData } from "../data";

interface UseConnectionsOptions {
  load?: () => Promise<Connection[]>;
}

export const useConnections = ({ load }: UseConnectionsOptions) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isToggle, setIsToggle] = useState(true);

  const appliedStrategies = connections.reduce<Record<string, boolean>>(
    (acc, conn) => ({ ...acc, [conn.connection.type]: true }),
    {},
  );
  const displayCards = connectionCardData
    .filter(({ id }) => !(id in appliedStrategies))
    .slice(0, isToggle ? 3 : undefined);

  useEffect(() => {
    const $load = async () => {
      try {
        const data = (await load?.()) ?? [];
        setConnections(data);
      } catch (error) {
        console.log(`[settings:connections] Failed`, error);
      }
    };
    void $load();
  }, [load]);

  return {
    connections,
    displayCards,
    isToggle,
    toggle: () => setIsToggle((prev) => !prev),
  };
};
