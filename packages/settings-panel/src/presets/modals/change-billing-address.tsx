"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

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
  Spinner,
} from "@notion-kit/shadcn";

const billingAddressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  businessName: z.string().optional(),
});
type BillingAddressSchema = z.infer<typeof billingAddressSchema>;

interface ChangeBillingAddressProps {
  defaultValues?: Partial<BillingAddressSchema>;
  onConfirm?: (address: BillingAddressSchema) => Promise<void>;
}

export function ChangeBillingAddress({
  defaultValues,
  onConfirm,
}: ChangeBillingAddressProps) {
  const form = useForm<BillingAddressSchema>({
    resolver: zodResolver(billingAddressSchema),
    defaultValues: {
      country: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      businessName: "",
      ...defaultValues,
    },
  });
  const submit = form.handleSubmit(async (values) => {
    await onConfirm?.(values);
  });

  return (
    <DialogContent className="w-105">
      <DialogTitle className="text-left" typography="h2">
        Change your address
      </DialogTitle>
      <Form {...form}>
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country / Region</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="185 Berry St" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address line 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Suite 550" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code</FormLabel>
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
                  <FormLabel>Business name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                </FormItem>
              )}
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
              type="submit"
              variant="blue"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              Update
              {form.formState.isSubmitting && <Spinner />}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
