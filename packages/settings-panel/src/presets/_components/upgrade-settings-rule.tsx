"use client";

import { useState } from "react";

import { Plan } from "@notion-kit/schemas";
import { Dialog } from "@notion-kit/shadcn";

import {
  SettingsRule,
  useSettings,
  useStripePromise,
  type SettingsRuleProps,
} from "@/core";
import { getUpgradePlan, isPlanAbove } from "@/lib/plans";
import type { UpgradeSchema } from "@/lib/types";
import { useBillingActions } from "@/presets/hooks";
import { Upgrade } from "@/presets/modals";

interface UpgradeSettingsRuleProps extends SettingsRuleProps {
  plan?: Plan;
}

/**
 * A context-aware wrapper around `SettingsRule` that:
 * 1. Hides the plan badge when the workspace plan ≥ required plan
 * 2. Opens the `<Upgrade />` modal when the plan badge is clicked
 */
export function UpgradeSettingsRule({
  plan,
  ...props
}: UpgradeSettingsRuleProps) {
  const {
    settings: { workspace },
  } = useSettings();
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
