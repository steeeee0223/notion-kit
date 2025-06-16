"use client";

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

  const form = useForm<LoginSchema>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });
  const { formState, handleSubmit } = form;

  const submit = handleSubmit(async (data) => {
    if (mode === "sign_up") {
      const name = data.email.split("@")[0]!;
      await authClient.signUp.email(
        { name, ...data, callbackURL },
        {
          onSuccess: () => {
            toast("Sign up success");
          },
          onError: ({ error }) => {
            toast.error("Sign up error", { description: error.message });
            console.log("Sign up error", error);
          },
        },
      );
    } else {
      await authClient.signIn.email(
        { ...data, callbackURL },
        {
          onSuccess: () => {
            toast("Sign in success");
          },
          onError: ({ error }) => {
            toast.error("Sign in error", { description: error.message });
            console.log("Sign in error", error);
          },
        },
      );
    }
  });

  const errorMessage =
    formState.errors.email?.message ?? formState.errors.password?.message;

  return { form, errorMessage, submit };
}
