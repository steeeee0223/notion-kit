"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from "@notion-kit/shadcn";

import { Avatar } from "../../_components";
import { Enable2FAMethod } from "./enable-2fa-method";

const passwordSchema = z.object({
  password: z.string().min(1, "Required"),
});
type PasswordSchema = z.infer<typeof passwordSchema>;

interface Add2FAFormProps {
  email: string;
  preferredName: string;
  avatarUrl?: string;
  onPasswordForgot?: () => Promise<void> | void;
  onSubmit?: (password: string) => Promise<boolean> | boolean;
}

export function Add2FAForm({
  email,
  preferredName,
  avatarUrl,
  onPasswordForgot,
  onSubmit,
}: Add2FAFormProps) {
  const [enable2FA, setEnable2FA] = useState(false);

  const form = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });
  const { formState, handleSubmit, setFocus } = form;
  const error =
    formState.errors.root?.message ?? formState.errors.password?.message;

  const submit = handleSubmit(async ({ password }) => {
    const ok = await onSubmit?.(password);
    if (ok) setEnable2FA(true);
  });

  const [isSendingEmail, startTransition] = useTransition();

  const handlePasswordForgot = () =>
    startTransition(async () => {
      await onPasswordForgot?.();
      form.setError("root", {
        message: `A password reset link has been sent to ${email}.`,
      });
    });

  useEffect(() => {
    setFocus("password");
  }, [setFocus]);

  return (
    <DialogContent className="w-[330px] p-5">
      <Form {...form}>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogIcon className="relative size-9">
              <Avatar
                src={avatarUrl}
                fallback={preferredName}
                className="size-9 *:data-[slot=avatar-fallback]:text-2xl"
              />
              <Icon.LockedFilled className="absolute -right-1 -bottom-1 size-5 fill-red" />
            </DialogIcon>
            <DialogTitle>
              To continue, we need to verify your identity
            </DialogTitle>
            {!error && (
              <DialogDescription className="text-primary">
                {email}
              </DialogDescription>
            )}
          </DialogHeader>
          <FormMessage>{error}</FormMessage>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    data-size="lg"
                    type="password"
                    placeholder="Your password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="submit"
              variant="blue"
              size="sm"
              className="w-full"
              disabled={formState.isSubmitting || isSendingEmail}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="hint"
              size="sm"
              className="w-full"
              disabled={formState.isSubmitting || isSendingEmail}
              onClick={handlePasswordForgot}
            >
              Forgot password
            </Button>
          </DialogFooter>
        </form>
      </Form>
      <Dialog open={enable2FA} onOpenChange={setEnable2FA}>
        <Enable2FAMethod />
      </Dialog>
    </DialogContent>
  );
}
