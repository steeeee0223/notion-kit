"use client";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@notion-kit/shadcn";

export function Enable2FAMethod() {
  return (
    <DialogContent className="w-[330px] p-5">
      <DialogHeader>
        <DialogIcon>
          <Icon.LockShield className="size-8 fill-icon" />
        </DialogIcon>
        <DialogTitle>Turn on 2-step verification</DialogTitle>
        <DialogDescription>
          Confirm it's you when you use a password with a verification code
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button className="group h-auto w-full items-start justify-start px-4 py-2.5 text-left">
          <Icon.AuthenticatorCode className="mr-2.5 size-5 fill-icon group-hover:fill-blue" />
          <div className="min-w-0">
            <div className="truncate text-sm leading-5">
              Code from authenticator
            </div>
            <span className="text-xs/[1.35] whitespace-normal text-muted">
              Generate a one-time code in your authenticator app
            </span>
          </div>
        </Button>
        <Button className="group h-auto w-full items-start justify-start px-4 py-2.5 text-left">
          <Icon.TextMessage className="mr-2.5 size-5 fill-icon group-hover:fill-blue" />
          <div className="min-w-0">
            <div className="truncate text-sm leading-5">Text me a code</div>
            <span className="text-xs/[1.35] whitespace-normal text-muted">
              Add and verify your phone number
            </span>
          </div>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
