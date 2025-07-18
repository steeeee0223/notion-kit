"use client";

import { ConnectionsSection } from "./connections-section";
import { DiscoverSection } from "./discover-section";
import { useConnections } from "./use-connections";

export function Connections() {
  const { connections, ...props } = useConnections();

  return (
    <div className="space-y-12">
      <ConnectionsSection connections={connections} />
      <DiscoverSection {...props} />
    </div>
  );
}
