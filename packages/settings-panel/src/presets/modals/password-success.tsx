"use client";

import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import { Dialog, DialogContent } from "@notion-kit/shadcn";

export const PasswordSuccess = () => {
  const { isOpen, closeModal } = useModal();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        forceMount
        className="w-[280px] gap-0 p-4 text-sm"
        onClick={(e) => e.stopPropagation()}
        hideClose
        noTitle
      >
        <div className="my-4 flex justify-center">
          <Icon.Check className="size-[27px] flex-shrink-0 fill-primary/85" />
        </div>
        <h2 className="mb-1 px-2.5 text-center text-sm/tight font-medium">
          Your password has been saved
        </h2>
        <div className="mb-4 text-center text-xs/snug text-secondary">
          You&apos;ll be able to log in, even if you lose access to your school
          email address.
        </div>
      </DialogContent>
    </Dialog>
  );
};
