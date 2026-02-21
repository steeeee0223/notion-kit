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
  Input,
  Spinner,
} from "@notion-kit/shadcn";

const billingEmailSchema = z.object({
  email: z.email(),
});
type BillingEmailSchema = z.infer<typeof billingEmailSchema>;

interface ChangeBillingEmailProps {
  email?: string;
  onConfirm?: (email: string) => Promise<void>;
}

export function ChangeBillingEmail({
  email = "",
  onConfirm,
}: ChangeBillingEmailProps) {
  const form = useForm<BillingEmailSchema>({
    resolver: zodResolver(billingEmailSchema),
    defaultValues: { email },
  });
  const submit = form.handleSubmit(async (values) => {
    await onConfirm?.(values.email);
  });

  return (
    <DialogContent className="w-105">
      <DialogTitle className="text-left" typography="h2">
        Change billing email
      </DialogTitle>
      <Form {...form}>
        <form onSubmit={submit} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder={email} {...field} />
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
