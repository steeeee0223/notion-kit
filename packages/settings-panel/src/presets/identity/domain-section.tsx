"use client";

import { useTranslation } from "react-i18next";

import { SettingsRule, SettingsSection } from "../../core";

export function DomainSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.domain", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.domains} plan="business" />
      <SettingsRule {...trans.creation} plan="enterprise" />
      <SettingsRule {...trans.claim} plan="enterprise" />
    </SettingsSection>
  );
}
