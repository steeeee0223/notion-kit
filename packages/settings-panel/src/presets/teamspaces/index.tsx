import { useSettings } from "../../core";
import { Scope } from "../../lib";
import { TeamspacesSection } from "./teamspaces-section";

export function Teamspaces() {
  const { scopes } = useSettings();

  if (!scopes.has(Scope.TeamspaceRead)) return null;
  return (
    <div className="space-y-[18px]">
      <TeamspacesSection />
    </div>
  );
}
