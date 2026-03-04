"use client";

import { useState } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Dialog, Separator } from "@notion-kit/shadcn";

import {
  SettingsSection,
  useSettings,
  useSettingsApi,
  useStripePromise,
} from "@/core";
import { getUpgradePlan } from "@/lib/plans";
import { Scope, type UpgradeSchema } from "@/lib/types";
import { TextLinks } from "@/presets/_components";
import { Upgrade } from "@/presets/modals";
import { PlansTable } from "@/presets/tables";

export function AllPlansSection() {
  const { scopes } = useSettings();
  const { billing } = useSettingsApi();
  const stripePromise = useStripePromise();
  const canUpgrade = scopes.has(Scope.Upgrade);

  const [open, setOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<string | null>(null);
  const upgradePlan = targetPlan ? getUpgradePlan(targetPlan) : undefined;

  const handleUpgrade = (plan: string) => {
    setTargetPlan(plan);
    setOpen(true);
  };

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
        <PlansTable canUpgrade={canUpgrade} onUpgrade={handleUpgrade} />
        <Separator />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        {upgradePlan && (
          <Upgrade
            plan={upgradePlan}
            stripePromise={stripePromise}
            onUpgrade={async (data: UpgradeSchema) => {
              await billing?.upgrade?.(
                targetPlan!.toLowerCase(),
                data.billingInterval === "year",
              );
              setOpen(false);
            }}
          />
        )}
      </Dialog>
    </SettingsSection>
  );
}
