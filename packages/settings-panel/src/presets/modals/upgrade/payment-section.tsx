"use client";

import { PaymentElement, useElements } from "@stripe/react-stripe-js";

import {
  FormItem,
  FormLabel,
  Input,
  Label,
  SelectPreset,
} from "@notion-kit/shadcn";

export function PaymentSection() {
  try {
    const elements = useElements();
    if (elements) {
      return (
        <FormItem>
          <FormLabel>Payment method</FormLabel>
          <PaymentElement />
        </FormItem>
      );
    }
  } catch {
    // No Stripe Elements provider — render fallback
  }
  return <PaymentFallback />;
}

const COUNTRY_OPTIONS: Record<string, string> = {
  US: "United States",
  TW: "Taiwan",
  JP: "Japan",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  AU: "Australia",
};

function PaymentFallback() {
  return (
    <div className="flex flex-col gap-2">
      <Label>Payment method</Label>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
        <FormItem className="col-span-2">
          <FormLabel>Card number</FormLabel>
          <Input placeholder="1234 1234 1234 1234" disabled />
        </FormItem>
        <FormItem>
          <FormLabel>Expiration date</FormLabel>
          <Input placeholder="MM / YY" disabled />
        </FormItem>
        <FormItem>
          <FormLabel>Security code</FormLabel>
          <Input placeholder="CVC" disabled />
        </FormItem>
        <FormItem className="col-span-2">
          <FormLabel>Country</FormLabel>
          <SelectPreset
            options={COUNTRY_OPTIONS}
            placeholder="Select a country"
            disabled
          />
        </FormItem>
      </div>
    </div>
  );
}
