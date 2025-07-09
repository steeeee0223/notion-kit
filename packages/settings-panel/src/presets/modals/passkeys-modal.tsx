"use client";

import { useEffect, useRef, useState } from "react";

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
import { toDateString } from "@notion-kit/utils";

import type { Passkey } from "../../lib";
import { usePasskeys } from "../account/use-passkeys";

export function PasskeysModal() {
  const { isOpen, closeModal } = useModal();
  const { passkeys, error, isPending, create, update, remove, clearError } =
    usePasskeys();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        forceMount
        className="w-100 p-5"
        onClick={(e) => e.stopPropagation()}
        /**
         * tmporary fix
         * @see https://github.com/radix-ui/primitives/issues/1241
         */
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.body.style.pointerEvents = "";
        }}
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
                onEnterRename={clearError}
                onRename={update}
                onDelete={remove}
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
            onClick={() => create()}
            disabled={isPending}
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
            disabled={isPending}
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
  onEnterRename?: () => void;
  onRename?: (data: { id: string; name: string }) => void;
  onDelete?: (id: string) => void;
}

function PasskeyCard({
  passkey,
  onEnterRename,
  onRename,
  onDelete,
}: PasskeyCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const enterEditName = () => {
    setIsEditing(true);
    onEnterRename?.();
  };
  const [saveName] = useTransition(() => {
    if (name !== passkey.name) {
      onRename?.({ id: passkey.id, name });
    }
    setIsEditing(false);
  });

  useEffect(() => {
    setName(passkey.name);
  }, [passkey.name]);

  return (
    <div className="flex h-[56px] items-center gap-2.5 rounded-sm border border-border px-4 py-2.5">
      <Icon.Key className="size-8 fill-blue" />
      <div className="flex min-w-0 flex-col">
        {isEditing ? (
          <Input
            ref={inputRef}
            className="w-[180px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              void saveName();
            }}
          />
        ) : (
          <div className="text-sm text-primary">{name}</div>
        )}
        <div className="text-xs text-secondary">
          Created at {toDateString(passkey.createdAt)}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="hint" className="ml-auto size-6">
            <Icon.Dots className="fill-muted" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[180px]"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (isEditing) {
              inputRef.current?.focus();
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              Icon={<Icon.PencilLine className="size-5 fill-current" />}
              Body="Rename passkey"
              onSelect={enterEditName}
            />
            <DropdownMenuItem
              Icon={<Icon.Trash className="size-4 fill-current" />}
              Body="Delete passkey"
              onSelect={() => onDelete?.(passkey.id)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
