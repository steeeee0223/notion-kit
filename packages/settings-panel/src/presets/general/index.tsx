"use client";

import { useSettings } from "../../core";
import { Scope } from "../../lib";
import { AnalyticsSection } from "./analytics-section";
import { DangerSection } from "./danger-section";
import { ExportSection } from "./export-section";
import { WorkspaceSettingsSection } from "./workspace-settings-section";

export function General() {
  const { scopes } = useSettings();

  return (
    <div className="space-y-[18px]">
      {scopes.has(Scope.WorkspaceUpdate) && (
        <>
          <WorkspaceSettingsSection />
          <ExportSection />
          <AnalyticsSection />
        </>
      )}
      <DangerSection />
    </div>
  );
}
