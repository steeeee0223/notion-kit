"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";
import type { TabType } from "../data";
import { useGuestsCount } from "../hooks";

interface InviteSectionProps {
  onTabChange: (tab: TabType) => void;
}

export function InviteSection({ onTabChange }: InviteSectionProps) {
  const guests = useGuestsCount();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("security.invite", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.access} plan="plus">
        <Switch size="sm" disabled checked />
      </SettingsRule>
      <SettingsRule
        title={trans.invite.title}
        description={
          <TextLinks
            i18nKey="security.invite.invite.description"
            values={{ count: guests }}
            onClick={() => onTabChange("people")}
          />
        }
        plan="enterprise"
      >
        <Switch size="sm" disabled checked />
      </SettingsRule>
      <SettingsRule {...trans.guest} plan="enterprise">
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.member} plan="plus">
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.user} plan="plus">
        <Switch size="sm" disabled />
      </SettingsRule>
    </SettingsSection>
  );
}
