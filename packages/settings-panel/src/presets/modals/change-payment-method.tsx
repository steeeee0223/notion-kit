"use client";

import { useState, useTransition } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";

import {
  Button,
  DialogClose,
  DialogContent,
  DialogTitle,
  Spinner,
} from "@notion-kit/shadcn";

import { StripeElements } from "@/presets/_components";

interface ChangePaymentMethodProps {
  stripePromise: Promise<Stripe | null>;
  onConfirm?: () => Promise<void>;
}

export function ChangePaymentMethod({
  stripePromise,
  onConfirm,
}: ChangePaymentMethodProps) {
  return (
    <DialogContent className="w-105">
      <StripeElements stripePromise={stripePromise}>
        <PaymentMethodForm onConfirm={onConfirm} />
      </StripeElements>
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
