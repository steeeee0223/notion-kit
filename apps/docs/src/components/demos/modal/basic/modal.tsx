"use client";

import { useModal } from "@notion-kit/modal";
import { Dialog, DialogClose, DialogContent } from "@notion-kit/shadcn";

export const Modal = () => {
  const { isOpen, closeModal } = useModal();
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent noTitle className="flex items-center text-2xl font-bold">
        Modal
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};
