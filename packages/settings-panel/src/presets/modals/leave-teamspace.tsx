"use client";

import { useTransition } from "react";

import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@notion-kit/shadcn";

interface LeaveTeamspaceProps {
  name: string;
  onLeave?: () => void;
}

/**
 * @note cloned from `DeleteGuest`
 */
export function LeaveTeamspace({ name, onLeave }: LeaveTeamspaceProps) {
  const [isLeaving, startTransition] = useTransition();
  const leave = () => startTransition(() => onLeave?.());

  return (
    <DialogContent className="w-[300px] p-5">
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
          {isLeaving && <Spinner />}
        </Button>
        <DialogClose asChild>
          <Button variant="hint" size="sm" className="h-7 w-fit">
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
