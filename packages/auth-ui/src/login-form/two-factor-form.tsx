"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@notion-kit/ui/primitives";

import { useAuth } from "../auth-provider";

const schema = z.object({
  code: z.string().min(1, "Enter a verification code."),
});

export function TwoFactorForm({
  methods,
  callbackURL,
}: {
  methods: string[];
  callbackURL?: string;
}) {
  const { auth, redirect } = useAuth();
  const [backup, setBackup] = useState(!methods.includes("totp"));
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });
  const submit = form.handleSubmit(async ({ code }) => {
    try {
      const result = backup
        ? await auth.twoFactor.verifyBackupCode({ code })
        : await auth.twoFactor.verifyTotp({ code });
      if (result.error) throw new Error(result.error.message);
      redirect?.(callbackURL ?? "/");
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Verification failed.",
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="w-full max-w-80 space-y-4">
        <p>Verify your identity to finish signing in.</p>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {backup ? "Backup code" : "Authenticator code"}
              </FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    autoComplete="one-time-code"
                    inputMode={backup ? "text" : "numeric"}
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Verify
        </Button>
        {methods.includes("totp") && (
          <Button
            type="button"
            variant="hint"
            disabled={form.formState.isSubmitting}
            onClick={() => {
              setBackup((value) => !value);
              form.reset({ code: "" });
            }}
          >
            {backup ? "Use an authenticator code" : "Use a backup code"}
          </Button>
        )}
        {form.formState.errors.root?.message && (
          <p role="alert">{form.formState.errors.root.message}</p>
        )}
      </form>
    </Form>
  );
}
