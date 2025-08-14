"use client";

import { CircleHelp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Switch } from "@notion-kit/shadcn";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";

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
      <SettingsRule {...trans.saml} plan="business" />
      <SettingsRule {...trans.login} plan="business" />
      <SettingsRule {...trans.creation}>
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.linked} />
    </SettingsSection>
  );
}
