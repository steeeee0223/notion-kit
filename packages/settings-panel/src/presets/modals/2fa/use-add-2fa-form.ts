"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod/v4";

import { useAppForm } from "../forms";

const passwordSchema = z.object({
  password: z.string().min(1, "Required"),
});

interface UseAdd2FAFormOptions {
  onSubmit?: (pass: string) => Promise<void>;
  onPasswordForgot?: () => Promise<void>;
}

export function useAdd2FAForm({
  onSubmit,
  onPasswordForgot,
}: UseAdd2FAFormOptions) {
  const [isSendingEmail, startTransition] = useTransition();

  const [error, setError] = useState(false);

  const form = useAppForm({
    defaultValues: { password: "" },
    validators: { onSubmit: passwordSchema },
    onSubmit: async ({ value }) => {
      await onSubmit?.(value.password);
    },
  });

  const disabled = form.state.isSubmitting || isSendingEmail;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await form.handleSubmit();
  };

  const handlePasswordForgot = () =>
    startTransition(async () => {
      await onPasswordForgot?.();
      setError(true);
    });

  return { disabled, error, form, submit, handlePasswordForgot };
}
