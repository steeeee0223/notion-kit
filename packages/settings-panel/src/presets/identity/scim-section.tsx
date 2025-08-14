"use client";

import { useTranslation } from "react-i18next";

import { SettingsRule, SettingsSection } from "../../core";

export function ScimSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.scim", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.scim} plan="enterprise" />
    </SettingsSection>
  );
}
