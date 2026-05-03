"use client";

import { Plan } from "@notion-kit/schemas";
import { useTranslation } from "@notion-kit/ui/i18n";

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
