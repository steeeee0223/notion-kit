"use client";

import { useTranslation } from "@notion-kit/i18n";

import { SettingsSection, useSettings } from "../../core";
import type { Connection } from "../../lib";
import { ConnectionsTable } from "../tables/my-connections";

interface ConnectionsSectionProps {
  connections: Connection[];
}

export function ConnectionsSection({ connections }: ConnectionsSectionProps) {
  const { connections: actions } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("my-connections.title", { returnObjects: true });

  return (
    <SettingsSection title={trans} hideSeparator>
      <ConnectionsTable
        data={connections}
        // TODO impl. add connection
        onDisconnect={actions?.delete}
      />
    </SettingsSection>
  );
}
