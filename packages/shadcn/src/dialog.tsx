"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@notion-kit/cn";

import { contentVariants } from "./variants";
import { VisuallyHidden } from "./visually-hidden";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
      className,
    )}
    {...props}
  />
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  hideClose?: boolean;
  noTitle?: boolean;
}
const DialogContent = ({
  className,
  children,
  hideClose = false,
  noTitle,
  ...props
}: DialogContentProps) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      className={cn(
        contentVariants({ variant: "modal" }),
        "rounded-sm",
        className,
      )}
      {...props}
      {...(noTitle && { "aria-describedby": undefined })}
    >
      {noTitle && (
        <VisuallyHidden asChild>
          <DialogTitle />
        </VisuallyHidden>
      )}
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="bg-primary/5 text-primary/45 hover:bg-primary/10 data-[state=open]:bg-primary absolute top-4 right-4 rounded-full p-0.5 transition-opacity focus:outline-hidden focus-visible:outline-hidden disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex w-full flex-col items-center gap-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex w-full flex-col items-center gap-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn(
      "text-primary dark:text-primary/80 text-center text-lg leading-none font-semibold tracking-tight break-words",
      className,
    )}
    style={{ marginTop: 0 }}
    {...props}
  />
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn("text-muted dark:text-muted-dark text-sm", className)}
    {...props}
  />
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
