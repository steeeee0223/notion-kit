"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { toast } from "@notion-kit/ui/primitives";

import { useAuth } from "../auth-provider";
import { resolveAppURL } from "../lib/app-url";
import type { ForgotPasswordStage, LoginMode } from "./types";

const loginSchema = z.object({
  forgotPassword: z.literal(false),
  email: z.email(),
  password: z.string().min(1, "Incorrect password."),
});
const forgotPasswordSchema = z.object({
  forgotPassword: z.literal(true),
  email: z.email(),
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

export function useLoginForm({
  mode,
  callbackURL: requestedCallbackURL,
}: UseLoginFormOptions) {
  const { auth, appURL, resetPasswordURL, redirect } = useAuth();
  const callbackURL = resolveAppURL(appURL, requestedCallbackURL ?? "/");
  const [twoFactorMethods, setTwoFactorMethods] = useState<string[] | null>(
    null,
  );

  const [forgotPasswordStage, setForgotPasswordStage] =
    useState<ForgotPasswordStage>("none");

  const [loading, setLoading] = useState(false);
  const form = useForm<LoginFormSchema>({
    defaultValues: { forgotPassword: false, email: "", password: "" },
    disabled: loading,
    resolver: zodResolver(formSchema),
  });
  const { formState, handleSubmit, setError, setValue, reset } = form;

  const errorMessage =
    formState.errors.root?.message ??
    formState.errors.email?.message ??
    formState.errors.password?.message;

  const submit = handleSubmit(async ({ email, password, forgotPassword }) => {
    setLoading(true);
    try {
      if (forgotPassword) {
        if (!resetPasswordURL)
          throw new Error("Password reset is not configured for this app.");
        const result = await auth.requestPasswordReset({
          email,
          redirectTo: resetPasswordURL,
        });
        if (result.error) throw new Error(result.error.message);
        setForgotPasswordStage("link_sent");
        return;
      }
      if (mode === "sign_up") {
        const name = email.split("@")[0]!;
        const result = await auth.signUp.email({
          name,
          email,
          password,
          preferredName: name,
          callbackURL,
        });
        if (result.error) throw new Error(result.error.message);
        toast("Check your email to verify your account.");
      } else {
        const result = await auth.signIn.email({
          email,
          password,
          callbackURL,
        });
        if (result.error) throw new Error(result.error.message);
        const challenge = z
          .object({
            twoFactorRedirect: z.literal(true),
            twoFactorMethods: z.array(z.string()),
          })
          .safeParse(result.data);
        if (challenge.success) {
          setTwoFactorMethods(challenge.data.twoFactorMethods);
          return;
        }
        toast("Sign in success");
        redirect?.(callbackURL);
      }
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error ? error.message : "Authentication failed",
      });
    } finally {
      setLoading(false);
    }
  });

  const handlePasswordForgot = useCallback(() => {
    setForgotPasswordStage("email");
    setValue("forgotPassword", true);
    setValue("password", "");
  }, [setValue]);

  const resetForm = useCallback(() => {
    setForgotPasswordStage("none");
    setTwoFactorMethods(null);
    reset({ forgotPassword: false, password: "" });
  }, [reset]);

  return {
    form,
    twoFactorMethods,
    forgotPasswordStage,
    errorMessage,
    handlePasswordForgot,
    resetForm,
    submit,
  };
}
