"use client";

import { useTranslation } from "@notion-kit/ui/i18n";
import { Plan, Role } from "@notion-kit/schemas";
import { Switch } from "@notion-kit/ui/primitives";

import { SettingsSection } from "@/core";
import {
  UpgradeSettingsRule as SettingsRule,
  TextLinks,
} from "@/presets/_components";

import type { TabType } from "../data";
import { usePeople } from "../hooks";

interface InviteSectionProps {
  onTabChange: (tab: TabType) => void;
}

export function InviteSection({ onTabChange }: InviteSectionProps) {
  const { data: guests } = usePeople((res) =>
    Object.values(res).reduce(
      (acc, member) => (member.role === Role.GUEST ? acc + 1 : acc),
      0,
    ),
  );
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("security.invite", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.access} plan={Plan.PLUS}>
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
        plan={Plan.ENTERPRISE}
      >
        <Switch size="sm" disabled checked />
      </SettingsRule>
      <SettingsRule {...trans.guest} plan={Plan.ENTERPRISE}>
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.member} plan={Plan.PLUS}>
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.user} plan={Plan.PLUS}>
        <Switch size="sm" disabled />
      </SettingsRule>
    </SettingsSection>
  );
}
