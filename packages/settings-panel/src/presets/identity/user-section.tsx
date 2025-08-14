"use client";

import { CircleHelp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";

export function UserSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.user", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <div className="text-sm/4 font-normal text-secondary">
        {trans.description}
      </div>
      <HintButton
        icon={CircleHelp}
        label={trans.buttons.hint}
        href="https://www.notion.com/help/managed-users-dashboard"
      />
      <SettingsRule {...trans.dashboard} plan="enterprise" />
      <SettingsRule {...trans.profile} plan="enterprise" />
      <SettingsRule {...trans.external} plan="enterprise" />
      <SettingsRule {...trans.support} plan="enterprise" />
      <SettingsRule {...trans.session} plan="enterprise" />
      <SettingsRule {...trans.logout} plan="enterprise" />
      <SettingsRule {...trans.password} plan="enterprise" />
      <SettingsRule {...trans.mail} plan="enterprise" />
    </SettingsSection>
  );
}
