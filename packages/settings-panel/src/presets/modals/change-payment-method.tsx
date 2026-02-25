"use client";

import { useState, useTransition } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type {
  Stripe,
  StripeElementLocale,
  StripeElementsOptionsMode,
} from "@stripe/stripe-js";

import { useTranslation } from "@notion-kit/i18n";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogTitle,
  Spinner,
} from "@notion-kit/shadcn";

import {
  stripeDark,
  stripeLight,
} from "@/presets/_components/stripe-appearance";

interface ChangePaymentMethodProps {
  stripePromise: Promise<Stripe | null>;
  theme?: "light" | "dark";
  onConfirm?: () => Promise<void>;
}

export function ChangePaymentMethod({
  stripePromise,
  theme = "light",
  onConfirm,
}: ChangePaymentMethodProps) {
  const { i18n } = useTranslation();

  const options: StripeElementsOptionsMode = {
    mode: "setup",
    currency: "usd",
    paymentMethodTypes: ["card"],
    locale: i18n.language as StripeElementLocale,
    appearance: theme === "dark" ? stripeDark : stripeLight,
  };

  return (
    <DialogContent className="w-105">
      <Elements stripe={stripePromise} options={options}>
        <PaymentMethodForm onConfirm={onConfirm} />
      </Elements>
    </DialogContent>
  );
}

interface PaymentMethodFormProps {
  onConfirm?: () => Promise<void>;
}

function PaymentMethodForm({ onConfirm }: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = () => {
    if (!stripe || !elements || !isComplete) return;
    startTransition(async () => {
      const { error: submitError } = await elements.submit();
      if (submitError) return;
      await onConfirm?.();
    });
  };

  return (
    <>
      <DialogTitle className="text-left" typography="h2">
        Change your payment method
      </DialogTitle>
      <div className="flex flex-col gap-4">
        {!isReady && <PaymentSkeleton />}
        <PaymentElement
          onReady={() => setIsReady(true)}
          onChange={(e) => setIsComplete(e.complete)}
          options={{ layout: "tabs" }}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <DialogClose asChild>
          <Button
            type="button"
            variant="hint"
            size="sm"
            className="text-secondary"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="blue"
          size="sm"
          disabled={!isReady || !isComplete || isPending}
          onClick={handleSubmit}
        >
          Update
          {isPending && <Spinner />}
        </Button>
      </div>
    </>
  );
}

function PaymentSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-7 animate-pulse rounded-md bg-input" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-7 animate-pulse rounded-md bg-input" />
        <div className="h-7 animate-pulse rounded-md bg-input" />
      </div>
      <div className="h-7 animate-pulse rounded-md bg-input" />
    </div>
  );
}
