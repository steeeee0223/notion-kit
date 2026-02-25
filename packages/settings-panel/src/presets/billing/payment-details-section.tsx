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
import { useSettingsApi, useStripePromise } from "@/core/settings-provider";
import { useBilling } from "@/presets/hooks/queries";
import {
  ChangeBillingAddress,
  ChangeBillingEmail,
  ChangePaymentMethod,
} from "@/presets/modals";

export function PaymentDetailsSection() {
  const { billing: actions } = useSettingsApi();
  const stripePromise = useStripePromise();
  const { data: billing } = useBilling();
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("payment-details", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans["payment-method"].title}
        description={billing.paymentMethod ?? trans["payment-method"].none}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["payment-method"].button}
            </Button>
          </DialogTrigger>
          <ChangePaymentMethod
            stripePromise={stripePromise}
            onConfirm={actions?.editMethod}
          />
        </Dialog>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["billed-to"].title}
        description={billing.billedTo ?? "-"}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["billed-to"].button}
            </Button>
          </DialogTrigger>
          <ChangeBillingAddress
            stripePromise={stripePromise}
            onConfirm={actions?.editBilledTo}
          />
        </Dialog>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["billing-email"].title}
        description={billing.billingEmail ?? "-"}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["billing-email"].button}
            </Button>
          </DialogTrigger>
          <ChangeBillingEmail
            email={billing.billingEmail}
            onConfirm={actions?.editEmail}
          />
        </Dialog>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["invoice-emails"].title}
        description={trans["invoice-emails"].description}
      >
        <Switch
          size="sm"
          checked={billing.invoiceEmails}
          onCheckedChange={actions?.toggleInvoiceEmails}
        />
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans.vat.title}
        description={billing.vatNumber ?? trans.vat.none}
      >
        <Button
          size="sm"
          className="w-36"
          disabled={!billing.vatNumber}
          onClick={actions?.editVat}
        >
          {trans.vat.button}
        </Button>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
