import { useCallback, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressElement, useElements } from "@stripe/react-stripe-js";
import type {
  Stripe,
  StripeAddressElementChangeEvent,
} from "@stripe/stripe-js";
import { useForm } from "react-hook-form";
import { z } from "zod/mini";

import { useTranslation } from "@notion-kit/i18n";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Label,
  Spinner,
} from "@notion-kit/shadcn";

import type { BillingAddress } from "@/lib/types";
import { StripeElements } from "@/presets/_components";

interface ChangeBillingAddressProps {
  stripePromise?: Promise<Stripe | null>;
  defaultCountry?: string;
  defaultBusinessName?: string;
  onConfirm?: (
    address: BillingAddress & { businessName: string },
  ) => Promise<void>;
}

export function ChangeBillingAddress({
  stripePromise,
  defaultCountry = "US",
  defaultBusinessName = "",
  onConfirm,
}: ChangeBillingAddressProps) {
  if (!stripePromise) {
    return (
      <ChangeBillingAddressNative
        defaultCountry={defaultCountry}
        defaultBusinessName={defaultBusinessName}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <ChangeBillingAddressStripe
      stripePromise={stripePromise}
      defaultCountry={defaultCountry}
      defaultBusinessName={defaultBusinessName}
      onConfirm={onConfirm}
    />
  );
}

interface StripeFormWrapperProps {
  stripePromise: Promise<Stripe | null>;
  defaultCountry: string;
  defaultBusinessName: string;
  onConfirm?: (
    address: BillingAddress & { businessName: string },
  ) => Promise<void>;
}

function ChangeBillingAddressStripe({
  stripePromise,
  defaultCountry,
  defaultBusinessName,
  onConfirm,
}: StripeFormWrapperProps) {
  return (
    <DialogContent className="w-105">
      <StripeElements stripePromise={stripePromise}>
        <AddressFormStripe
          defaultCountry={defaultCountry}
          defaultBusinessName={defaultBusinessName}
          onConfirm={onConfirm}
        />
      </StripeElements>
    </DialogContent>
  );
}

interface AddressFormStripeProps {
  defaultCountry: string;
  defaultBusinessName: string;
  onConfirm?: (
    address: BillingAddress & { businessName: string },
  ) => Promise<void>;
}

function AddressFormStripe({
  defaultCountry,
  defaultBusinessName,
  onConfirm,
}: AddressFormStripeProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.change-billing-address",
  });

  const elements = useElements();
  const [isPending, startTransition] = useTransition();
  const [businessName, setBusinessName] = useState(defaultBusinessName);
  const [addressComplete, setAddressComplete] = useState(false);
  const [addressValue, setAddressValue] = useState<BillingAddress | null>(null);

  const handleAddressChange = useCallback(
    (event: StripeAddressElementChangeEvent) => {
      setAddressComplete(event.complete);
      if (event.complete) {
        setAddressValue(event.value as BillingAddress);
      }
    },
    [],
  );

  const handleSubmit = () => {
    if (!elements || !addressComplete || !addressValue) return;
    startTransition(async () => {
      await onConfirm?.({ ...addressValue, businessName });
    });
  };

  return (
    <>
      <DialogTitle>{t("title")}</DialogTitle>
      <div className="flex flex-col gap-4">
        <AddressElement
          options={{
            mode: "billing",
            defaultValues: {
              address: { country: defaultCountry },
            },
            display: { name: "full" },
          }}
          onChange={handleAddressChange}
        />
        <div className="flex flex-col gap-1">
          <Label>{t("business-name")}</Label>
          <Input
            placeholder="Acme Inc."
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
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
          disabled={!addressComplete || isPending}
          onClick={handleSubmit}
        >
          {t("update")}
          {isPending && <Spinner />}
        </Button>
      </div>
    </>
  );
}

const nativeFormSchema = z.object({
  name: z.string(),
  country: z.string(),
  postalCode: z.string(),
  businessName: z.string(),
});
type NativeFormSchema = z.infer<typeof nativeFormSchema>;

interface NativeFormProps {
  defaultCountry: string;
  defaultBusinessName: string;
  onConfirm?: (
    address: BillingAddress & { businessName: string },
  ) => Promise<void>;
}

/**
 * Native fallback form (no Stripe dependency)
 */
function ChangeBillingAddressNative({
  defaultCountry,
  defaultBusinessName,
  onConfirm,
}: NativeFormProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.change-billing-address",
  });

  const form = useForm<NativeFormSchema>({
    resolver: zodResolver(nativeFormSchema),
    defaultValues: {
      name: "",
      country: defaultCountry,
      postalCode: "",
      businessName: defaultBusinessName,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onConfirm?.({
      name: values.name,
      address: {
        line1: "",
        line2: null,
        city: "",
        state: "",
        postal_code: values.postalCode,
        country: values.country,
      },
      businessName: values.businessName,
    });
  });

  return (
    <DialogContent className="w-105">
      <DialogTitle>{t("title")}</DialogTitle>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("full-name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Ada Lovelace" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("country")}</FormLabel>
                <FormControl>
                  <Input placeholder="United States" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("postal-code")}</FormLabel>
                <FormControl>
                  <Input placeholder="94107" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("business-name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
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
              type="submit"
              variant="blue"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              {t("update")}
              {form.formState.isSubmitting && <Spinner />}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
