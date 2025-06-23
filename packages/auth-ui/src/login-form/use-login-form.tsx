"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@notion-kit/shadcn";

import { useAuth } from "../auth-provider";
import type { ForgotPasswordStage, LoginMode } from "./types";

const loginSchema = z.object({
  forgotPassword: z.literal(false),
  email: z.string().email(),
  password: z.string().min(1, "Incorrect password."),
});
const forgotPasswordSchema = z.object({
  forgotPassword: z.literal(true),
  email: z.string().email(),
  password: z.string().length(0),
});
const formSchema = z.discriminatedUnion("forgotPassword", [
  loginSchema,
  forgotPasswordSchema,
]);

type LoginFormSchema = z.infer<typeof formSchema>;

interface UseLoginFormOptions {
  mode: LoginMode;
  callbackURL?: string;
}

export function useLoginForm({ mode, callbackURL }: UseLoginFormOptions) {
  const authClient = useAuth();

  const [forgotPasswordStage, setForgotPasswordStage] =
    useState<ForgotPasswordStage>("none");

  const [loading, setLoading] = useState(false);
  const form = useForm<LoginFormSchema>({
    defaultValues: { email: "", password: "" },
    disabled: loading,
    resolver: zodResolver(formSchema),
  });
  const { formState, handleSubmit, setError, setValue, reset } = form;

  const errorMessage =
    formState.errors.root?.message ??
    formState.errors.email?.message ??
    formState.errors.password?.message;

  const sendResetLink = async () => {
    console.log("Sending reset link...");
    setLoading(true);
    await Promise.resolve();
    setLoading(false);
    setForgotPasswordStage("link_sent");
  };

  const submit = handleSubmit(async (data) => {
    if (data.forgotPassword) {
      return await sendResetLink();
    }
    if (mode === "sign_up") {
      const name = data.email.split("@")[0]!;
      await authClient.signUp.email(
        { name, ...data, callbackURL },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onSuccess: () => void toast("Sign up success"),
          onError: ({ error }) => {
            setError("root", { message: error.message });
            console.error("Sign up error", error);
          },
        },
      );
    } else {
      await authClient.signIn.email(
        { ...data, callbackURL },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onSuccess: () => void toast("Sign in success"),
          onError: ({ error }) => {
            setError("root", { message: error.message });
            console.error("Sign in error", error);
          },
        },
      );
    }
  });

  const handlePasswordForgot = useCallback(() => {
    setForgotPasswordStage("email");
    setValue("forgotPassword", true);
    setValue("password", "");
  }, [setValue]);

  const resetForm = useCallback(() => {
    setForgotPasswordStage("none");
    reset({ forgotPassword: false, password: "" });
  }, [reset]);

  return {
    form,
    forgotPasswordStage,
    errorMessage,
    handlePasswordForgot,
    resetForm,
    submit,
  };
}
