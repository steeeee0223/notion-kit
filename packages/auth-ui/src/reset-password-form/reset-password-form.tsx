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

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export function ResetPasswordForm({
  token,
  onSuccess,
}: {
  token?: string;
  onSuccess?: () => void;
}) {
  const { auth } = useAuth();
  const [complete, setComplete] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  if (!token)
    return (
      <p role="alert">
        This password reset link is invalid. Request a new link.
      </p>
    );
  if (complete) return <p role="status">Your password has been reset.</p>;

  const submit = form.handleSubmit(async ({ password }) => {
    try {
      const result = await auth.resetPassword({ token, newPassword: password });
      if (result.error) throw new Error(result.error.message);
      setComplete(true);
      onSuccess?.();
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Could not reset password.",
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="w-full max-w-80 space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Reset password
        </Button>
        {form.formState.errors.root?.message && (
          <p role="alert">{form.formState.errors.root.message}</p>
        )}
      </form>
    </Form>
  );
}
