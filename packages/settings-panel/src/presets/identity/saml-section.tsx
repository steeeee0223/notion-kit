"use client";

import { CircleHelp } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { Plan } from "@notion-kit/schemas";
import { Switch } from "@notion-kit/shadcn";

import { SettingsSection } from "@/core";
import {
  HintButton,
  UpgradeSettingsRule as SettingsRule,
} from "@/presets/_components";

export function SamlSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.saml", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <HintButton
        icon={CircleHelp}
        label={trans.buttons.hint}
        href="https://www.notion.com/help/saml-sso-configuration"
      />
      <SettingsRule {...trans.saml} plan={Plan.BUSINESS} />
      <SettingsRule {...trans.login} plan={Plan.BUSINESS} />
      <SettingsRule {...trans.creation}>
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.linked} />
    </SettingsSection>
  );
}
