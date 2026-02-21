"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Plan } from "@notion-kit/schemas";
import { Button, Dialog, DialogTrigger, Separator } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "@/core";
import { ChangePlan } from "@/presets/modals/change-plan";

interface PlanSectionProps {
  plan: Plan;
  onChangePlan?: (plan: Plan) => Promise<void>;
}

export function PlanSection({ plan, onChangePlan }: PlanSectionProps) {
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("plan", { returnObjects: true });

  return (
    <SettingsSection title={t("title")}>
      <SettingsRule title={trans.title} description={plan}>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans.button}
            </Button>
          </DialogTrigger>
          <ChangePlan currentPlan={plan} onConfirm={onChangePlan} />
        </Dialog>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
