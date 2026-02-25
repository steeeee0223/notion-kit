"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Dialog, DialogTrigger, Separator } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "@/core";
import { useSettings, useSettingsApi } from "@/core/settings-provider";
import { ChangePlan } from "@/presets/modals";

export function PlanSection() {
  const {
    settings: { workspace },
  } = useSettings();
  const { billing } = useSettingsApi();
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("plan", { returnObjects: true });

  return (
    <SettingsSection title={t("title")}>
      <SettingsRule title={trans.title} description={workspace.plan}>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans.button}
            </Button>
          </DialogTrigger>
          <ChangePlan
            currentPlan={workspace.plan}
            onConfirm={billing?.changePlan}
          />
        </Dialog>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
