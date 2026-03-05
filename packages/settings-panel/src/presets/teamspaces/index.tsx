import { useScopes } from "@/core";
import { Scope } from "@/lib/types";

import { TeamspacesSection } from "./teamspaces-section";

export function Teamspaces() {
  const scopes = useScopes();

  if (!scopes.has(Scope.TeamspaceRead)) return null;
  return (
    <div className="space-y-[18px]">
      <TeamspacesSection />
    </div>
  );
}
