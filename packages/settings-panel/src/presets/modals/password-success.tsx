"use client";

import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@notion-kit/shadcn";

export const PasswordSuccess = () => {
  const { isOpen, closeModal } = useModal();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        forceMount
        className="w-[280px] gap-0 p-4"
        onClick={(e) => e.stopPropagation()}
        hideClose
      >
        <DialogHeader>
          <DialogIcon>
            <Icon.Check className="size-[27px] fill-icon" />
          </DialogIcon>
          <DialogTitle>Your password has been saved</DialogTitle>
          <DialogDescription>
            You&apos;ll be able to log in, even if you lose access to your
            school email address.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
