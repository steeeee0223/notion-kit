"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Plan } from "@notion-kit/schemas";

import { SettingsSection } from "@/core";
import { UpgradeSettingsRule as SettingsRule } from "@/presets/_components";

export function DomainSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.domain", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.domains} plan={Plan.BUSINESS} />
      <SettingsRule {...trans.creation} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.claim} plan={Plan.ENTERPRISE} />
    </SettingsSection>
  );
}
