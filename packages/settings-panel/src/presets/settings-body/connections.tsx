"use client";

import { ArrowUpRight, CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { Button } from "@notion-kit/shadcn";

import { ConnectionCard, HintButton } from "../_components";
import { SettingsSection, useSettings } from "../../core";
import type { ConnectionStrategy } from "../../lib";
import { ConnectionsTable } from "../my-connections";
import { useConnections } from "./use-connections";

export const Connections = () => {
  const { connections: actions } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const { title, buttons, discover } = t("my-connections", {
    returnObjects: true,
  });
  /** Connections & Cards */
  const { connections, displayCards, isToggle, toggle } = useConnections({
    load: actions?.load,
  });

  return (
    <div className="space-y-12">
      <SettingsSection title={title} hideSeparator>
        <ConnectionsTable
          data={connections}
          // TODO impl. add connection
          onDisconnect={actions?.delete}
        />
      </SettingsSection>
      <SettingsSection
        className="space-y-2.5"
        title={discover.title}
        hideSeparator
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayCards.map((card, i) => (
            <ConnectionCard
              key={i}
              {...card}
              onConnect={async () =>
                await actions?.add?.(card.id as ConnectionStrategy)
              }
            />
          ))}
        </div>
        <Button variant="hint" size="xs" className="h-7" onClick={toggle}>
          {discover.buttons[isToggle ? "more" : "less"]}
        </Button>
        <div className="flex flex-0 flex-col items-start">
          <HintButton
            icon={ArrowUpRight}
            label={buttons.browse}
            href="https://www.notion.com/integrations/all"
          />
          <HintButton
            icon={ArrowUpRight}
            label={buttons.integrations}
            href="https://www.notion.com/profile/integrations"
          />
          <HintButton
            icon={CircleHelp}
            label={buttons.more}
            href="https://www.notion.com/help/add-and-manage-connections-with-the-api"
          />
        </div>
      </SettingsSection>
    </div>
  );
};
