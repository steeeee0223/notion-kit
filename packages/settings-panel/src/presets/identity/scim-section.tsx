"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Plan } from "@notion-kit/schemas";

import { SettingsSection } from "@/core";
import { UpgradeSettingsRule as SettingsRule } from "@/presets/_components";

export function ScimSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.scim", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.scim} plan={Plan.ENTERPRISE} />
    </SettingsSection>
  );
}
