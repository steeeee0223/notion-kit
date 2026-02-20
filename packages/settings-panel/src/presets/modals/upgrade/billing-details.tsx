"use client";

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@notion-kit/shadcn";

import type { UpgradeSchema } from "./types";

export function BillingDetails() {
  const { control } = useFormContext<UpgradeSchema>();

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Ada Lovelace" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business name (optional)</FormLabel>
            <FormControl>
              <Input placeholder="Acme Inc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="vatId"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>VAT/GST number (optional)</FormLabel>
            <FormControl>
              <Input placeholder="123456789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
