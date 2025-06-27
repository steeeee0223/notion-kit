"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useTransition } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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

export const Add2FAForm = ({
  email,
  preferredName,
  avatarUrl,
  onPasswordForgot,
  onSubmit,
}: Add2FAFormProps) => {
  const { isOpen, closeModal, openModal } = useModal();

  const form = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });
  const { formState, handleSubmit, reset, setFocus } = form;
  const error =
    formState.errors.root?.message ?? formState.errors.password?.message;

  const onClose = () => {
    closeModal();
    reset();
  };

  const submit = handleSubmit(async ({ password }) => {
    const ok = await onSubmit?.(password);
    if (ok) openModal(<Enable2FAMethod />);
  });

  const [sendEmail, isSendingEmail] = useTransition(() => onPasswordForgot?.());
  const handlePasswordForgot = async () => {
    await sendEmail();
    form.setError("root", {
      message: `A password reset link has been sent to ${email}.`,
    });
  };

  useEffect(() => {
    setFocus("password");
  }, [setFocus]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="w-[330px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <Form {...form}>
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogIcon className="relative size-9">
                <Avatar className="size-full bg-main select-none">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {preferredName.at(0) ?? ""}
                  </AvatarFallback>
                </Avatar>
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
      </DialogContent>
    </Dialog>
  );
};
