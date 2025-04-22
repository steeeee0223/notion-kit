"use client";

import { useLayoutEffect, useRef } from "react";

import { useTransition } from "@notion-kit/hooks";
import { useModal } from "@notion-kit/modal";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

interface BaseModalProps {
  title: string;
  primary: string;
  secondary: string;
  onTrigger?: () => void | Promise<void>;
}

export const BaseModal = ({
  title,
  primary,
  secondary,
  onTrigger,
}: BaseModalProps) => {
  const { isOpen, closeModal } = useModal();
  const [trigger, loading] = useTransition(() => onTrigger?.());

  const reset = async () => {
    await trigger();
    closeModal();
  };

  const buttonRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        forceMount
        hideClose
        className="flex w-[300px] flex-col items-start justify-center gap-2 p-6"
        onClick={(e) => e.stopPropagation()}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-normal tracking-wide">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="py-1.5">
          <Button
            ref={buttonRef}
            onClick={reset}
            variant="red"
            size="sm"
            className="w-full"
          >
            {primary}
            {loading && <Spinner className="ml-2 text-white" />}
          </Button>
          <Button onClick={closeModal} size="sm" className="w-full">
            {secondary}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
