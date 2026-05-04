"use client";

import { useState } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Plan } from "@notion-kit/schemas";
import { Dialog, Separator } from "@notion-kit/ui/primitives";

import { SettingsSection, useScopes, useStripePromise } from "@/core";
import { getUpgradePlan } from "@/lib/plans";
import { Scope } from "@/lib/types";
import { TextLinks } from "@/presets/_components";
import { useBillingActions } from "@/presets/hooks";
import { Upgrade } from "@/presets/modals";
import { PlansTable } from "@/presets/tables";

export function AllPlansSection() {
  const scopes = useScopes();
  const { upgrade } = useBillingActions();
  const stripePromise = useStripePromise();
  const canUpgrade = scopes.has(Scope.Upgrade);

  const [open, setOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
  const upgradePlan = targetPlan ? getUpgradePlan(targetPlan) : undefined;

  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("plans.all-plans", { returnObjects: true });

  return (
    <SettingsSection title={trans.title} hideSeparator>
      <div className="mb-4 text-sm font-normal text-[#787774]">
        <TextLinks
          i18nKey="plans.all-plans.description"
          hrefs="https://www.notion.so/help/category/plans-billing-and-payment"
          target="_blank"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-5">
        <PlansTable
          canUpgrade={canUpgrade}
          onUpgrade={(plan) => {
            setTargetPlan(plan);
            setOpen(true);
          }}
        />
        <Separator />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        {upgradePlan && (
          <Upgrade
            plan={upgradePlan}
            stripePromise={stripePromise}
            onUpgrade={async (data) => {
              if (!targetPlan) return;
              await upgrade({
                plan: targetPlan,
                annual: data.billingInterval === "year",
              });
              setOpen(false);
            }}
          />
        )}
      </Dialog>
    </SettingsSection>
  );
}
