"use client";

import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Spinner,
  toast,
} from "@notion-kit/shadcn";

import { useAuth } from "../auth-provider";
import { handleError } from "../lib";
import type { LoginMode } from "./types";
import { useLoginForm } from "./use-login-form";

interface LoginFormProps {
  mode: LoginMode;
  callbackURL?: string;
  className?: string;
  onModeChange?: (mode: LoginMode) => void;
}

export function LoginForm({
  className,
  mode,
  callbackURL,
  onModeChange,
}: LoginFormProps) {
  const { auth, redirect } = useAuth();
  const {
    form,
    forgotPasswordStage,
    errorMessage,
    handlePasswordForgot,
    resetForm,
    submit,
  } = useLoginForm({ mode, callbackURL });

  const [loading, setLoading] = useState(false);
  const disabled = form.formState.disabled || loading;

  const loginWithPasskey = async () => {
    await auth.signIn.passkey(
      {},
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => {
          toast("Logged in with passkey");
          redirect?.(callbackURL ?? "/");
        },
        onError: (e) => handleError(e, "Failed to login with passkey"),
      },
    );
  };

  const loginWithOauth = async (provider: "google" | "github") => {
    await auth.signIn.social(
      { provider, callbackURL },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => void toast(`Logged in with ${provider}`),
        onError: (e) => handleError(e, `Failed to login with ${provider}`),
      },
    );
  };

  return (
    <div
      className={cn(
        "mb-[4vh] flex max-w-80 flex-col items-center gap-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Button
            size="md"
            className="relative w-full"
            disabled={disabled}
            onClick={() => loginWithOauth("google")}
          >
            <Icon.GoogleLogo className="absolute left-2.5 fill-inherit" />
            Continue with Google
          </Button>
          <Button
            size="md"
            className="relative w-full"
            disabled={disabled}
            onClick={() => loginWithOauth("github")}
          >
            <Icon.GithubLogo className="absolute left-2.5 fill-inherit" />
            Continue with Github
          </Button>
          <Button size="md" className="relative w-full" disabled>
            <Icon.AppleLogo className="absolute left-2.5 fill-inherit" />
            Continue with Apple
          </Button>
          <Button size="md" className="relative w-full" disabled>
            <Icon.MicrosoftLogo className="absolute left-2.5 fill-inherit" />
            Continue with Microsoft
          </Button>
          <Button
            size="md"
            className="relative w-full"
            disabled={disabled}
            onClick={loginWithPasskey}
          >
            <Icon.PersonWithKey className="absolute left-2.5 fill-inherit" />
            Login with passkey
          </Button>
          <Button size="md" className="relative w-full" disabled>
            <Icon.Buildings className="absolute left-2.5 fill-inherit" />
            Single sign-on (SSO)
          </Button>
        </div>
        <Separator />
        {forgotPasswordStage === "link_sent" ? (
          <div className="text-center text-sm text-secondary">
            Check your inbox for the link to reset your password.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={submit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-transparent"
                        data-size="lg"
                        placeholder="Enter your email address..."
                        clear
                        onCancel={() => field.onChange("")}
                        {...field}
                      />
                    </FormControl>
                    {forgotPasswordStage === "none" && (
                      <FormDescription>
                        Use an organization email to easily collaborate with
                        teammates
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
              {forgotPasswordStage === "none" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="bg-transparent"
                          data-size="lg"
                          placeholder="Enter your email password..."
                          {...field}
                        />
                      </FormControl>
                      {mode === "sign_in" && (
                        <div
                          role="button"
                          className="inline cursor-pointer text-xs font-semibold text-blue select-none hover:text-red"
                          onPointerDown={handlePasswordForgot}
                        >
                          Forgot your password?
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              )}
              <Button
                variant="blue"
                size="md"
                type="submit"
                className="w-full"
                disabled={disabled}
              >
                {loading && <Spinner />}
                {forgotPasswordStage === "none"
                  ? "Continue"
                  : "Send reset link"}
              </Button>
              <FormMessage>{errorMessage}</FormMessage>
            </form>
          </Form>
        )}
      </div>
      {/* Footer */}
      <div className="text-center text-xs text-balance text-secondary *:[a]:text-muted *:[a]:underline *:[a]:underline-offset-2 *:[a]:hover:text-blue">
        By continuing, you acknowledge that you understand and agree to the{" "}
        <a href="/">Terms & Conditions</a> and <a href="/">Privacy Policy</a>.
      </div>
      <div
        role="button"
        className="cursor-pointer text-xs font-semibold text-blue select-none hover:text-red"
        onPointerDown={() => {
          resetForm();
          onModeChange?.(mode === "sign_in" ? "sign_up" : "sign_in");
        }}
      >
        {mode === "sign_up"
          ? "Already have an account?"
          : "Don't have an account?"}
      </div>
    </div>
  );
}
