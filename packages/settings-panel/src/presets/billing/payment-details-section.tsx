"use client";

import { useTranslation } from "@notion-kit/i18n";
import {
  Button,
  Dialog,
  DialogTrigger,
  Separator,
  Switch,
} from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "@/core";
import { ChangeBillingAddress } from "@/presets/modals/change-billing-address";
import { ChangeBillingEmail } from "@/presets/modals/change-billing-email";

interface PaymentDetailsSectionProps {
  paymentMethod?: string;
  billedTo?: string;
  billingEmail?: string;
  invoiceEmails?: boolean;
  vatNumber?: string;
  onEditMethod?: () => void;
  onEditBilledTo?: (address: {
    country: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    businessName?: string;
  }) => Promise<void>;
  onEditEmail?: (email: string) => Promise<void>;
  onToggleInvoiceEmails?: (checked: boolean) => void;
  onEditVat?: () => void;
}

export function PaymentDetailsSection({
  paymentMethod,
  billedTo,
  billingEmail,
  invoiceEmails = false,
  vatNumber,
  onEditMethod,
  onEditBilledTo,
  onEditEmail,
  onToggleInvoiceEmails,
  onEditVat,
}: PaymentDetailsSectionProps) {
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("payment-details", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans["payment-method"].title}
        description={paymentMethod ?? trans["payment-method"].none}
      >
        <Button size="sm" className="w-36" onClick={onEditMethod}>
          {trans["payment-method"].button}
        </Button>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["billed-to"].title}
        description={billedTo ?? "-"}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["billed-to"].button}
            </Button>
          </DialogTrigger>
          <ChangeBillingAddress onConfirm={onEditBilledTo} />
        </Dialog>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["billing-email"].title}
        description={billingEmail ?? "-"}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["billing-email"].button}
            </Button>
          </DialogTrigger>
          <ChangeBillingEmail email={billingEmail} onConfirm={onEditEmail} />
        </Dialog>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["invoice-emails"].title}
        description={trans["invoice-emails"].description}
      >
        <Switch
          size="sm"
          checked={invoiceEmails}
          onCheckedChange={onToggleInvoiceEmails}
        />
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans.vat.title}
        description={vatNumber ?? trans.vat.none}
      >
        <Button
          size="sm"
          className="w-36"
          disabled={!vatNumber}
          onClick={onEditVat}
        >
          {trans.vat.button}
        </Button>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
