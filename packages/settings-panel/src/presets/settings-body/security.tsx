"use client";

import React from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Switch } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";
import type { TabType } from "../data";
import { usePeople } from "../people";

interface CardItemProps {
  title: string;
  description: string;
  action: string;
  more: string;
}

const CardItem: React.FC<CardItemProps> = ({
  title,
  description,
  action,
  more,
}) => {
  return (
    <section className="max-w-[340px] text-sm">
      <header className="font-semibold">{title}</header>
      <p className="mt-1 mb-4 text-secondary">{description}</p>
      <footer className="flex flex-wrap gap-x-3 gap-y-2">
        <Button tabIndex={0} variant="blue" size="sm">
          {action}
        </Button>
        <Button tabIndex={0} size="sm">
          {more}
        </Button>
      </footer>
    </section>
  );
};

interface SecurityProps {
  onTabChange: (tab: TabType) => void;
}

export const Security: React.FC<SecurityProps> = ({ onTabChange }) => {
  const { guests } = usePeople();
  /** i18n */
  const { t } = useTranslation("settings");
  const { cards, general, invite } = t("security", { returnObjects: true });

  return (
    <div className="space-y-[18px]">
      <div className="space-y-[18px] rounded-sm border-[1px] border-solid border-border p-4">
        <CardItem {...cards.sso} />
        <CardItem {...cards.scim} />
      </div>
      <SettingsSection title={general.title}>
        <SettingsRule {...general.publish} plan="enterprise">
          <Switch size="sm" disabled />
        </SettingsRule>
        <SettingsRule {...general.duplicate} plan="enterprise">
          <Switch size="sm" disabled />
        </SettingsRule>
        <SettingsRule {...general.export} plan="enterprise">
          <Switch size="sm" disabled />
        </SettingsRule>
      </SettingsSection>
      <SettingsSection title={invite.title}>
        <SettingsRule {...invite.access} plan="plus">
          <Switch size="sm" disabled checked />
        </SettingsRule>
        <SettingsRule
          title={invite.invite.title}
          description={
            <TextLinks
              i18nKey="security.invite.invite.description"
              values={{ count: guests.length }}
              onClick={() => onTabChange("people")}
            />
          }
          plan="enterprise"
        >
          <Switch size="sm" disabled checked />
        </SettingsRule>
        <SettingsRule {...invite.guest} plan="enterprise">
          <Switch size="sm" disabled />
        </SettingsRule>
        <SettingsRule {...invite.member} plan="plus">
          <Switch size="sm" disabled />
        </SettingsRule>
        <SettingsRule {...invite.user} plan="plus">
          <Switch size="sm" disabled />
        </SettingsRule>
      </SettingsSection>
    </div>
  );
};
