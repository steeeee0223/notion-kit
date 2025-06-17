"use client";

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
} from "@notion-kit/shadcn";

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
  const { form, errorMessage, submit } = useLoginForm({ mode, callbackURL });

  return (
    <div
      className={cn(
        "mb-[4vh] flex max-w-80 flex-col items-center gap-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Button size="md" className="relative w-full">
            <Icon.AppleLogo className="absolute left-2.5 fill-inherit" />
            Login with Apple
          </Button>
          <Button size="md" className="relative w-full">
            <Icon.GoogleLogo className="absolute left-2.5 fill-inherit" />
            Login with Google
          </Button>
        </div>
        <Separator />
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
                  <FormDescription>
                    Use an organization email to easily collaborate with
                    teammates
                  </FormDescription>
                </FormItem>
              )}
            />
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
                    <div className="text-xs font-semibold text-blue hover:text-red">
                      <a
                        href="/"
                        rel="noopener noreferrer"
                        className="inline cursor-pointer text-inherit select-none"
                      >
                        Forgot your password?
                      </a>
                    </div>
                  )}
                </FormItem>
              )}
            />
            <Button variant="blue" size="md" type="submit" className="w-full">
              Continue
            </Button>
            <FormMessage>{errorMessage}</FormMessage>
          </form>
        </Form>
      </div>
      {/* Footer */}
      <div className="text-center text-xs text-balance text-secondary *:[a]:text-muted *:[a]:underline *:[a]:underline-offset-2 *:[a]:hover:text-blue">
        By continuing, you acknowledge that you understand and agree to the{" "}
        <a href="/">Terms & Conditions</a> and <a href="/">Privacy Policy</a>.
      </div>
      <div
        role="button"
        className="cursor-pointer text-xs font-semibold text-blue select-none hover:text-red"
        onPointerDown={() =>
          onModeChange?.(mode === "sign_in" ? "sign_up" : "sign_in")
        }
      >
        {mode === "sign_up"
          ? "Already have an account?"
          : "Don't have an account?"}
      </div>
    </div>
  );
}
