"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Dialog, DialogTrigger, Separator } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "@/core";
import { useSettings } from "@/core/settings-provider";
import { useBillingActions } from "@/presets/hooks";
import { ChangePlan } from "@/presets/modals";

export function PlanSection() {
  const {
    settings: { workspace },
  } = useSettings();
  const { changePlan } = useBillingActions();
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
          <ChangePlan currentPlan={workspace.plan} onConfirm={changePlan} />
        </Dialog>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
