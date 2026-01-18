"use client";

import { useTransition } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

interface LogoutConfirmProps {
  title: string;
  description: string;
  onConfirm?: () => Promise<void> | void;
}

export function LogoutConfirm({
  title,
  description,
  onConfirm,
}: LogoutConfirmProps) {
  const [isPending, startTransition] = useTransition();
  const logout = () => startTransition(async () => await onConfirm?.());

  return (
    <DialogContent className="w-[324px] p-5" hideClose>
      <DialogHeader>
        <DialogIcon>
          <Icon.PersonBadgeExclamationMark className="size-8 fill-muted" />
        </DialogIcon>
        <DialogTitle typography="h2">{title}</DialogTitle>
        <DialogDescription typography="h2" className="text-muted">
          {description}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          type="submit"
          variant="red-fill"
          size="sm"
          className="w-full"
          onClick={logout}
          disabled={isPending}
        >
          {isPending && <Spinner className="text-current" />}
          Log out
        </Button>
        <DialogClose asChild>
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
