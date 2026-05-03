"use client";

import { useTranslation } from "@notion-kit/ui/i18n";
import { Plan } from "@notion-kit/schemas";
import { Switch } from "@notion-kit/ui/primitives";

import { SettingsSection } from "@/core";
import { UpgradeSettingsRule as SettingsRule } from "@/presets/_components";

export function GeneralSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("security.general", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.publish} plan={Plan.ENTERPRISE}>
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.duplicate} plan={Plan.ENTERPRISE}>
        <Switch size="sm" disabled />
      </SettingsRule>
      <SettingsRule {...trans.export} plan={Plan.ENTERPRISE}>
        <Switch size="sm" disabled />
      </SettingsRule>
    </SettingsSection>
  );
}
