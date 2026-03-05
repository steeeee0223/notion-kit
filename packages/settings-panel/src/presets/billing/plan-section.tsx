"use client";

import { useState } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Dialog, DialogTrigger, Separator } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "@/core";
import { useBillingActions, useWorkspace } from "@/presets/hooks";
import { ChangePlan } from "@/presets/modals";

export function PlanSection() {
  const { data: workspace } = useWorkspace();
  const { changePlan } = useBillingActions();
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("plan", { returnObjects: true });

  const [openChangePlan, setOpenChangePlan] = useState(false);

  return (
    <SettingsSection title={t("title")}>
      <SettingsRule title={trans.title} description={workspace.plan}>
        <Dialog open={openChangePlan} onOpenChange={setOpenChangePlan}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans.button}
            </Button>
          </DialogTrigger>
          <ChangePlan
            currentPlan={workspace.plan}
            onConfirm={async (plan) => {
              await changePlan(plan);
              setOpenChangePlan(false);
            }}
          />
        </Dialog>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
