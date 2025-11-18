"use client";

import { useTransition } from "react";

import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

interface LeaveTeamspaceProps {
  name: string;
  onLeave?: () => Promise<void> | void;
  onClose?: () => void;
}

/**
 * @note cloned from `DeleteGuest`
 */
export function LeaveTeamspace({
  name,
  onLeave,
  onClose,
}: LeaveTeamspaceProps) {
  const [isLeaving, startTransition] = useTransition();
  const leave = () =>
    startTransition(async () => {
      await onLeave?.();
      onClose?.();
    });

  return (
    <DialogContent
      forceMount
      className="w-[300px] p-5"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader>
        <DialogTitle typography="h2">Leave {name}?</DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-muted">
        You’ll no longer see this teamspace in your sidebar and you may lose
        permissions to the teamspace’s pages.
      </DialogDescription>
      <DialogFooter>
        <Button
          onClick={leave}
          variant="red-fill"
          size="sm"
          className="w-full font-semibold"
          disabled={isLeaving}
        >
          Remove
          {isLeaving && <Spinner className="text-current" />}
        </Button>
        <Button
          onClick={onClose}
          variant="hint"
          size="sm"
          className="h-7 w-fit"
        >
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
