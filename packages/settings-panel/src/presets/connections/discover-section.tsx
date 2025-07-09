"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { Button, toast } from "@notion-kit/shadcn";

import { HintButton } from "../_components";
import { SettingsSection, useSettings } from "../../core";
import {
  createDefaultFn,
  QUERY_KEYS,
  type ConnectionStrategy,
} from "../../lib";
import { ConnectionCard, type ConnectionCardProps } from "./connection-card";

interface DiscoverSectionProps {
  displayCards: ConnectionCardProps[];
  isToggle: boolean;
  toggle: () => void;
}

export function DiscoverSection({
  displayCards,
  isToggle,
  toggle,
}: DiscoverSectionProps) {
  const { settings, connections: actions } = useSettings();
  const queryKey = QUERY_KEYS.connections(settings.account.id);
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("my-connections", {
    returnObjects: true,
  });
  /** Actions */
  const queryClient = useQueryClient();
  const { mutateAsync: connect, isPending } = useMutation({
    mutationFn: actions?.add ?? createDefaultFn(),
    onSuccess: async (_, payload) => {
      toast.success(`Connected ${payload} successfully`);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error, payload) =>
      toast.error(`Connect ${payload} failed`, { description: error.message }),
  });

  return (
    <SettingsSection
      className="space-y-2.5"
      title={trans.discover.title}
      hideSeparator
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayCards.map((card, i) => (
          <ConnectionCard
            key={i}
            {...card}
            isConnecting={isPending}
            onConnect={() => connect(card.id as ConnectionStrategy)}
          />
        ))}
      </div>
      <Button variant="hint" size="xs" className="h-7" onClick={toggle}>
        {trans.discover.buttons[isToggle ? "more" : "less"]}
      </Button>
      <div className="flex flex-0 flex-col items-start">
        <HintButton
          icon={ArrowUpRight}
          label={trans.buttons.browse}
          href="https://www.notion.com/integrations/all"
        />
        <HintButton
          icon={ArrowUpRight}
          label={trans.buttons.integrations}
          href="https://www.notion.com/profile/integrations"
        />
        <HintButton
          icon={CircleHelp}
          label={trans.buttons.more}
          href="https://www.notion.com/help/add-and-manage-connections-with-the-api"
        />
      </div>
    </SettingsSection>
  );
}
