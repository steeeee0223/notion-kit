"use client";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Field,
} from "@notion-kit/shadcn";

import { Avatar } from "../../_components";
import { useAdd2FAForm } from "./use-add-2fa-form";

interface Add2FAFormProps {
  email: string;
  preferredName: string;
  avatarUrl?: string;
  onPasswordForgot?: () => Promise<void>;
  onSubmit?: (password: string) => Promise<void>;
}

export function Add2FAForm({
  email,
  preferredName,
  avatarUrl,
  onPasswordForgot,
  onSubmit,
}: Add2FAFormProps) {
  const { form, disabled, error, handlePasswordForgot, submit } = useAdd2FAForm(
    { onSubmit, onPasswordForgot },
  );

  return (
    <DialogContent className="w-90">
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
          <DialogDescription
            className={cn(error ? "text-red" : "text-primary")}
          >
            {error ? `A password reset link has been sent to ${email}.` : email}
          </DialogDescription>
        </DialogHeader>
        <form.AppField
          name="password"
          children={(field) => (
            <field.Text
              field={field}
              inputProps={{
                "data-size": "lg",
                type: "password",
                placeholder: "Your password",
              }}
            />
          )}
        />
        <Field>
          <Button
            type="submit"
            variant="blue"
            size="sm"
            className="w-full"
            disabled={disabled}
          >
            Continue
          </Button>
          <Button
            type="button"
            variant="hint"
            size="sm"
            className="w-full"
            disabled={disabled}
            onClick={handlePasswordForgot}
          >
            Forgot password
          </Button>
        </Field>
      </form>
    </DialogContent>
  );
}
