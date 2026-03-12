import { PaymentElement } from "@stripe/react-stripe-js";

import { useTranslation } from "@notion-kit/i18n";
import { Label } from "@notion-kit/shadcn";

export function PaymentSection() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.upgrade.payment-section",
  });

  return (
    <div className="flex flex-col gap-2">
      <Label>{t("title")}</Label>
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "never", googlePay: "never" },
          terms: { card: "never" },
        }}
      />
    </div>
  );
}
