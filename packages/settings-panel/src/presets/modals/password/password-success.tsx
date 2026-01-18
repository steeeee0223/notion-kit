"use client";

import { Icon } from "@notion-kit/icons";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@notion-kit/shadcn";

export function PasswordSuccess() {
  return (
    <DialogContent className="w-70" hideClose>
      <DialogHeader>
        <DialogIcon>
          <Icon.Check className="size-[27px] fill-icon" />
        </DialogIcon>
        <DialogTitle>Your password has been saved</DialogTitle>
        <DialogDescription>
          You&apos;ll be able to log in, even if you lose access to your school
          email address.
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
}
