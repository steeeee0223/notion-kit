"use client";

import { useTranslation } from "@notion-kit/ui/i18n";
import { Button, Separator } from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "@/core";
import { useSettingsApi } from "@/core/settings-provider";
import { useBilling } from "@/presets/hooks/queries";

export function InvoicesSection() {
  const { billing: actions } = useSettingsApi();
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
        <Button size="sm" className="w-36" onClick={actions?.viewInvoice}>
          {trans.upcoming.button}
        </Button>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
