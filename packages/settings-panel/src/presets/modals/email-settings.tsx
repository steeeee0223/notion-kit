"use client";

import { Button, DialogContent } from "@notion-kit/shadcn";

interface EmailSettingsProps {
  email: string;
  onSendVerification?: () => void;
}

export function EmailSettings({
  email,
  onSendVerification,
}: EmailSettingsProps) {
  return (
    <DialogContent className="w-[460px] p-8 text-sm" hideClose noTitle>
      <p className="my-0">
        Your current email is <span className="font-bold">{email}</span>.
        We&apos;ll send a temporary verification code to this email.
      </p>
      <Button
        tabIndex={0}
        variant="blue"
        size="sm"
        className="max-w-fit flex-shrink-0"
        onClick={onSendVerification}
      >
        Send verification code
      </Button>
    </DialogContent>
  );
}
