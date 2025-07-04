"use client";

import { useSettings } from "../../../core";
import { useConnections } from "../use-connections";
import { ConnectionsSection } from "./connections-section";
import { DiscoverSection } from "./discover-section";

export const Connections = () => {
  const { connections: actions } = useSettings();
  const { connections, ...props } = useConnections({
    load: actions?.load,
  });

  return (
    <div className="space-y-12">
      <ConnectionsSection connections={connections} />
      <DiscoverSection {...props} />
    </div>
  );
};
