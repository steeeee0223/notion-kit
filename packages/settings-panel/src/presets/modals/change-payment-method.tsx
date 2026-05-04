import { useState, useTransition } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";

import { useTranslation } from "@notion-kit/i18n";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogTitle,
  Spinner,
} from "@notion-kit/ui/primitives";

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
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.change-payment-method",
  });

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
        {t("title")}
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
            {t("cancel")}
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="blue"
          size="sm"
          disabled={!isReady || !isComplete || isPending}
          onClick={handleSubmit}
        >
          {t("update")}
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
