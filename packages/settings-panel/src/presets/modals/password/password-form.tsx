"use client";

import { useEffect, useState } from "react";
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
  FormLabel,
  FormMessage,
  Input,
} from "@notion-kit/shadcn";

import { PasswordSuccess } from "./password-success";

const error = "Please include additional unique characters.";
const passwordSchema = z
  .object({
    password: z.string().min(8, { error }),
    confirmPassword: z.string().min(1, { error }),
    currentPassword: z.string().min(1, { error }).optional(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password)
      ctx.issues.push({
        code: "custom",
        message: "Your new password does not match.",
        path: ["confirmPassword"],
        input: confirmPassword,
      });
  });
type PasswordSchema = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
  hasPassword?: boolean;
  onSubmit?: (pass: string, original?: string | null) => void | Promise<void>;
}

export function PasswordForm({ hasPassword, onSubmit }: PasswordFormProps) {
  const [success, setSuccess] = useState(false);

  const form = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "", currentPassword: "" },
  });
  const { formState, handleSubmit, trigger, watch } = form;

  const submit = handleSubmit(async ({ password, currentPassword }) => {
    await onSubmit?.(password, currentPassword);
    setSuccess(true);
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const sub = watch((_data, info) => {
      if (info.type !== "change" || info.name === "currentPassword") return;
      void trigger("confirmPassword");
    });
    return () => sub.unsubscribe();
  }, [trigger, watch]);

  return (
    <DialogContent className="w-[350px] p-6">
      <Form {...form}>
        <form onSubmit={submit} className="space-y-2">
          <DialogHeader>
            <DialogIcon>
              <Icon.Password className="size-[27px] fill-icon" />
            </DialogIcon>
            <DialogTitle>
              {hasPassword ? "Change password" : "Set a password"}
            </DialogTitle>
            <DialogDescription>
              Use a password at least 15 letters long, or at least 8 characters
              long with both letters and numbers. If you lose access to your
              school email address, you&apos;ll be able to log in using your
              password.
            </DialogDescription>
          </DialogHeader>
          {hasPassword && (
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter your current password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Current password"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter a new password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="New password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm your new password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormMessage>
            {Object.values(formState.errors).at(0)?.message}
          </FormMessage>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              variant="blue"
              size="sm"
              className="w-full"
              disabled={formState.isSubmitting}
            >
              {hasPassword ? "Change password" : "Set a password"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
      <Dialog open={success} onOpenChange={setSuccess}>
        <PasswordSuccess />
      </Dialog>
    </DialogContent>
  );
}
