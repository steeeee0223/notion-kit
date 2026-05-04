import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import type {
  Stripe,
  StripeElementLocale,
  StripeElementsOptionsMode,
} from "@stripe/stripe-js";

import { useTranslation } from "@notion-kit/i18n";
import { useTheme } from "@notion-kit/ui/primitives";

import { stripeDark, stripeLight } from "./stripe-appearance";

interface StripeElementsProps extends React.PropsWithChildren {
  stripePromise: Promise<Stripe | null>;
}

export function StripeElements({
  stripePromise,
  children,
}: StripeElementsProps) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();

  const resolvedOptions: StripeElementsOptionsMode = {
    mode: "setup",
    currency: "usd",
    paymentMethodTypes: ["card"],
    locale: i18n.language as StripeElementLocale,
    appearance: theme === "dark" ? stripeDark : stripeLight,
  };

  return (
    <Elements stripe={stripePromise} options={resolvedOptions}>
      {children}
    </Elements>
  );
}
