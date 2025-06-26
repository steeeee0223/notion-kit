"use client";

import { useState } from "react";

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

interface AddPasskeysProps {
  onAddPasskeys?: () => Promise<boolean> | boolean;
}

export const AddPasskeys = ({ onAddPasskeys }: AddPasskeysProps) => {
  const { isOpen, closeModal } = useModal();
  const [error, setError] = useState(false);

  const [addPasskeys, isAdding] = useTransition(async () => {
    const ok = await onAddPasskeys?.();
    if (!ok) setError(true);
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        forceMount
        className="w-100 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogIcon>
            <Icon.LockShield className="size-8 fill-primary/45" />
          </DialogIcon>
          <DialogTitle>Manage Passkeys</DialogTitle>
          <DialogDescription className="text-primary">
            Use your device's built-in security features like Face ID to sign in
            instead of remembering passwords.
          </DialogDescription>
          {error && (
            <div className="text-xs text-red">
              The passkey could not be saved; please try again.
            </div>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="submit"
            variant="blue"
            size="sm"
            className="w-full"
            onClick={addPasskeys}
            disabled={isAdding}
          >
            <Icon.PersonWithKey className="mr-1.5 size-3.5 fill-current" />
            Add new passkey
          </Button>
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={closeModal}
            disabled={isAdding}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
