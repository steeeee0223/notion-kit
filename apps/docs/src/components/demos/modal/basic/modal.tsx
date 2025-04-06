"use client";

import React from "react";

import { useModal } from "@notion-kit/modal";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@notion-kit/shadcn";

interface ModalProps {
  title: string;
  primary: string;
  secondary: string;
}

export const Modal: React.FC<ModalProps> = ({ title, primary, secondary }) => {
  const { isOpen, closeModal } = useModal();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        forceMount
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
            onClick={closeModal}
            variant="red"
            size="sm"
            className="w-full"
          >
            {primary}
          </Button>
          <Button onClick={closeModal} size="sm" className="w-full">
            {secondary}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
