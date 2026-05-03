"use client";

import { useState } from "react";

import { Plan } from "@notion-kit/schemas";
import { Dialog } from "@notion-kit/ui/primitives";

import { SettingsRule, useStripePromise, type SettingsRuleProps } from "@/core";
import { getUpgradePlan, isPlanAbove } from "@/lib/plans";
import type { UpgradeSchema } from "@/lib/types";
import { useBillingActions, useWorkspace } from "@/presets/hooks";
import { Upgrade } from "@/presets/modals";

interface UpgradeSettingsRuleProps extends SettingsRuleProps {
  plan?: Plan;
}

export function UpgradeSettingsRule({
  plan,
  ...props
}: UpgradeSettingsRuleProps) {
  const { data: workspace } = useWorkspace();
  const { upgrade } = useBillingActions();
  const stripePromise = useStripePromise();
  const [open, setOpen] = useState(false);

  const showPlan = plan && !isPlanAbove(workspace.plan, plan);
  const upgradePlan = showPlan ? getUpgradePlan(plan) : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SettingsRule
        {...props}
        plan={showPlan ? plan : undefined}
        onPlanClick={showPlan ? () => setOpen(true) : undefined}
      />
      {upgradePlan && plan && (
        <Upgrade
          plan={upgradePlan}
          stripePromise={stripePromise}
          onUpgrade={async (data: UpgradeSchema) => {
            await upgrade({
              plan,
              annual: data.billingInterval === "year",
            });
            setOpen(false);
          }}
        />
      )}
    </Dialog>
  );
}
