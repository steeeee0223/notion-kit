"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Separator } from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "@/core";
import { useBilling } from "@/presets/hooks/queries";
import { useBillingActions } from "@/presets/hooks/use-billing-actions";

export function InvoicesSection() {
  const { viewInvoice, canViewInvoice, isViewingInvoice } = useBillingActions();
  const { data: billing } = useBilling();
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("invoices", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans.upcoming.title}
        description={billing.upcomingInvoice ?? ""}
      >
        <Button
          size="sm"
          className="w-36"
          onClick={() => viewInvoice()}
          disabled={!canViewInvoice || isViewingInvoice}
        >
          {trans.upcoming.button}
        </Button>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
