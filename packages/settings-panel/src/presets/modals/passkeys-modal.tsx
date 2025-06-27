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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@notion-kit/shadcn";

import type { Passkey } from "../../lib";

interface PasskeysModalProps {
  passkeys?: Passkey[];
  onAddPasskey?: () => Promise<boolean> | boolean;
  onRename?: (data: { id: string; name: string }) => void;
  onDelete?: (id: string) => void;
}

export function PasskeysModal({
  passkeys = [],
  onAddPasskey,
  onRename,
  onDelete,
}: PasskeysModalProps) {
  const { isOpen, closeModal } = useModal();
  const [error, setError] = useState(false);

  const [addPasskey, isAdding] = useTransition(async () => {
    const ok = await onAddPasskey?.();
    if (ok) {
      closeModal();
    } else {
      setError(true);
    }
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
        {passkeys.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs">Active passkeys</div>
            {passkeys.map((passkey) => (
              <PasskeyCard
                key={passkey.id}
                passkey={passkey}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        <DialogFooter>
          <Button
            type="submit"
            variant="blue"
            size="sm"
            className="w-full"
            onClick={addPasskey}
            disabled={isAdding}
          >
            {passkeys.length > 0 ? (
              <Icon.Plus className="mr-1.5 size-3.5 fill-current" />
            ) : (
              <Icon.PersonWithKey className="mr-1.5 size-3.5 fill-current" />
            )}
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
}

interface PasskeyCardProps {
  passkey: Passkey;
  onRename?: (data: { id: string; name: string }) => void;
  onDelete?: (id: string) => void;
}

function PasskeyCard({ passkey, onRename, onDelete }: PasskeyCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex h-[56px] items-center rounded-sm border border-border px-4 py-2.5">
      <Icon.Key className="mr-2.5 size-6 fill-blue" />
      <div className="flex min-w-0 flex-col">
        {isEditing ? (
          <Input
            className="w-[180px]"
            defaultValue={passkey.name}
            onBlur={(e) => {
              onRename?.({ id: passkey.id, name: e.target.value });
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              onRename?.({ id: passkey.id, name: e.currentTarget.value });
              setIsEditing(false);
            }}
          />
        ) : (
          <div className="text-sm text-primary">{passkey.name}</div>
        )}
        <div className="text-xs text-secondary">
          Created at {passkey.createdAt}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="hint" className="ml-auto size-6">
            <Icon.Dots className="fill-muted" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          <DropdownMenuGroup>
            <DropdownMenuItem
              Icon={<Icon.PencilLine className="size-5 fill-current" />}
              Body="Rename passkey"
              onSelect={() => setIsEditing(true)}
            />
            <DropdownMenuItem
              Icon={<Icon.Trash className="size-5 fill-current" />}
              Body="Delete passkey"
              onSelect={() => onDelete?.(passkey.id)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
