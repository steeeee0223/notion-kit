"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Separator } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "@/core";

interface InvoicesSectionProps {
  upcomingInvoice?: string;
  onViewInvoice?: () => void;
}

export function InvoicesSection({
  upcomingInvoice,
  onViewInvoice,
}: InvoicesSectionProps) {
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("invoices", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans.upcoming.title}
        description={upcomingInvoice ?? ""}
      >
        <Button size="sm" className="w-36" onClick={onViewInvoice}>
          {trans.upcoming.button}
        </Button>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
