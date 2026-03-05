"use client";

import { PaymentElement } from "@stripe/react-stripe-js";

import { Label } from "@notion-kit/shadcn";

export function PaymentSection() {
  return (
    <div className="flex flex-col gap-2">
      <Label>Payment method</Label>
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
