"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@notion-kit/shadcn";

import { useAuth } from "../auth-provider";
import type { LoginMode } from "./types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Incorrect password."),
});
type LoginSchema = z.infer<typeof loginSchema>;

interface UseLoginFormOptions {
  mode: LoginMode;
  callbackURL?: string;
}

export function useLoginForm({ mode, callbackURL }: UseLoginFormOptions) {
  const authClient = useAuth();

  const [loading, setLoading] = useState(false);
  const form = useForm<LoginSchema>({
    defaultValues: { email: "", password: "" },
    disabled: loading,
    resolver: zodResolver(loginSchema),
  });
  const { formState, handleSubmit, setError } = form;

  const submit = handleSubmit(async (data) => {
    if (mode === "sign_up") {
      const name = data.email.split("@")[0]!;
      await authClient.signUp.email(
        { name, ...data, callbackURL },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onSuccess: () => {
            toast("Sign up success");
          },
          onError: ({ error }) => {
            setError("root", { message: error.message });
            console.log("Sign up error", error);
          },
        },
      );
    } else {
      await authClient.signIn.email(
        { ...data, callbackURL },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onSuccess: () => {
            toast("Sign in success");
          },
          onError: ({ error }) => {
            setError("root", { message: error.message });
            console.log("Sign in error", error);
          },
        },
      );
    }
  });

  const errorMessage =
    formState.errors.root?.message ??
    formState.errors.email?.message ??
    formState.errors.password?.message;

  return { form, errorMessage, submit };
}
