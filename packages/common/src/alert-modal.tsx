"use client";

import { useLayoutEffect, useRef, useTransition } from "react";

import {
  Button,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@notion-kit/shadcn";

interface AlertModalProps {
  title: string;
  primary: string;
  secondary: string;
  onTrigger?: () => void | Promise<void>;
}

export function AlertModal({
  title,
  primary,
  secondary,
  onTrigger,
}: AlertModalProps) {
  const [loading, startTransition] = useTransition();

  const trigger = () => startTransition(() => onTrigger?.());

  const buttonRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
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
          onClick={trigger}
          variant="red"
          size="sm"
          className="w-full"
        >
          {primary}
          {loading && <Spinner />}
        </Button>
        <DialogClose asChild>
          <Button size="sm" className="w-full">
            {secondary}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
