"use client";

import { useTransition } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import {
  Button,
  Dialog,
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

export const LogoutConfirm = ({
  title,
  description,
  onConfirm,
}: LogoutConfirmProps) => {
  const { isOpen, closeModal } = useModal();

  const [logout, isPending] = useTransition(() => onConfirm?.());

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        forceMount
        className="w-[324px] p-5"
        onClick={(e) => e.stopPropagation()}
        hideClose
      >
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
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={closeModal}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
