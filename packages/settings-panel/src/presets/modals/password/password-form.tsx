import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { useTranslation } from "@notion-kit/i18n";
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

interface PasswordSchema {
  password: string;
  confirmPassword: string;
  currentPassword?: string;
}

interface PasswordFormProps {
  hasPassword?: boolean;
  onSubmit?: (pass: string, original?: string | null) => void | Promise<void>;
}

export function PasswordForm({ hasPassword, onSubmit }: PasswordFormProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.password",
  });
  const [success, setSuccess] = useState(false);

  const error = t("errors.unique");
  const passwordSchema = z
    .object({
      password: z.string().min(8, { message: error }),
      confirmPassword: z.string().min(1, { message: error }),
      currentPassword: z.string().min(1, { message: error }).optional(),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password)
        ctx.issues.push({
          code: z.ZodIssueCode.custom,
          message: t("errors.mismatch"),
          path: ["confirmPassword"],
          input: confirmPassword,
        });
    });

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
          <DialogHeader align="center">
            <DialogIcon>
              <Icon.Password className="size-[27px] fill-icon" />
            </DialogIcon>
            <DialogTitle>
              {hasPassword ? t("title-change") : t("title-set")}
            </DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {hasPassword && (
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("current-label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("current-placeholder")}
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
                <FormLabel>{t("new-label")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("new-placeholder")}
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
                <FormLabel>{t("confirm-label")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("confirm-placeholder")}
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
              {hasPassword ? t("title-change") : t("title-set")}
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
