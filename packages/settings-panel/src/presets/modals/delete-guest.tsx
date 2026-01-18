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

interface DeleteGuestProps {
  name: string;
  onDelete?: () => void;
}

export function DeleteGuest({ name, onDelete }: DeleteGuestProps) {
  const [loading, startTransition] = useTransition();

  const onRemove = () => startTransition(() => onDelete?.());

  return (
    <DialogContent className="w-[300px] p-5">
      <DialogHeader>
        <DialogIcon>
          <Icon.UserX className="size-9 fill-default/45" />
        </DialogIcon>
        <DialogTitle typography="h2">
          Remove {name} from the workspace?
        </DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-muted">
        They will lose access to all shared pages. To add them as a guest in the
        future, a request must be submitted, or an admin must invite them.
      </DialogDescription>
      <DialogFooter>
        <Button
          onClick={onRemove}
          variant="red-fill"
          size="sm"
          className="w-full font-semibold"
        >
          Remove
          {loading && <Spinner className="text-current" />}
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
