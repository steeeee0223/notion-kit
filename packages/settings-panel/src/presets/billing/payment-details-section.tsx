"use client";

import { useState } from "react";

import { useTranslation } from "@notion-kit/i18n";
import {
  Button,
  Dialog,
  DialogTrigger,
  Separator,
  Switch,
} from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "@/core";
import { useStripePromise } from "@/core/settings-provider";
import { useBilling, useBillingActions } from "@/presets/hooks";
import {
  ChangeBillingAddress,
  ChangeBillingEmail,
  ChangePaymentMethod,
} from "@/presets/modals";

export function PaymentDetailsSection() {
  const stripePromise = useStripePromise();
  const { data: billing } = useBilling();
  const actions = useBillingActions();
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "billing" });
  const trans = t("payment-details", { returnObjects: true });

  const [openChangePaymentMethod, setOpenChangePaymentMethod] = useState(false);
  const [openChangeBilledTo, setOpenChangeBilledTo] = useState(false);
  const [openChangeBillingEmail, setOpenChangeBillingEmail] = useState(false);

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans["payment-method"].title}
        description={billing.paymentMethod ?? trans["payment-method"].none}
      >
        <Dialog
          open={openChangePaymentMethod}
          onOpenChange={setOpenChangePaymentMethod}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["payment-method"].button}
            </Button>
          </DialogTrigger>
          <ChangePaymentMethod
            stripePromise={stripePromise}
            onConfirm={async () => {
              await actions.editMethod();
              setOpenChangePaymentMethod(false);
            }}
          />
        </Dialog>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["billed-to"].title}
        description={billing.billedTo ?? "-"}
      >
        <Dialog open={openChangeBilledTo} onOpenChange={setOpenChangeBilledTo}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["billed-to"].button}
            </Button>
          </DialogTrigger>
          <ChangeBillingAddress
            stripePromise={stripePromise}
            onConfirm={async (addr) => {
              await actions.editBilledTo(addr);
              setOpenChangeBilledTo(false);
            }}
          />
        </Dialog>
      </SettingsRule>
      <Separator />
      <SettingsRule
        title={trans["billing-email"].title}
        description={billing.billingEmail ?? "-"}
      >
        <Dialog
          open={openChangeBillingEmail}
          onOpenChange={setOpenChangeBillingEmail}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="w-36">
              {trans["billing-email"].button}
            </Button>
          </DialogTrigger>
          <ChangeBillingEmail
            email={billing.billingEmail}
            onConfirm={async (email) => {
              await actions.editEmail(email);
              setOpenChangeBillingEmail(false);
            }}
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
          onCheckedChange={actions.toggleInvoiceEmails}
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
          onClick={actions.editVat}
        >
          {trans.vat.button}
        </Button>
      </SettingsRule>
      <Separator />
    </SettingsSection>
  );
}
