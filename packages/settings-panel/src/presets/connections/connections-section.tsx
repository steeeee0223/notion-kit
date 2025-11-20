"use client";

import { useTranslation } from "@notion-kit/i18n";

import { SettingsSection } from "../../core";
import type { Connection } from "../../lib";
import { ConnectionsTable } from "../tables";
import { useConnectionsActions } from "./use-connections-actions";

interface ConnectionsSectionProps {
  connections: Connection[];
}

export function ConnectionsSection({ connections }: ConnectionsSectionProps) {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("my-connections.title", { returnObjects: true });
  /** Actions */
  const { unlink } = useConnectionsActions();

  return (
    <SettingsSection title={trans} hideSeparator>
      <ConnectionsTable
        data={connections}
        // TODO impl. add connection
        onDisconnect={unlink}
      />
    </SettingsSection>
  );
}
