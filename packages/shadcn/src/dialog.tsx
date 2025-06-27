"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@notion-kit/cn";

import { contentVariants, Typography, typography } from "./variants";
import { VisuallyHidden } from "./visually-hidden";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}
interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  hideClose?: boolean;
  noTitle?: boolean;
}
function DialogContent({
  className,
  children,
  hideClose = false,
  noTitle,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
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
          <DialogPrimitive.Close
            className={cn(
              "absolute top-4 right-4 rounded-full bg-default/5 p-0.5 text-default/45 transition-opacity hover:bg-default/10 focus-visible:outline-hidden disabled:pointer-events-none data-[state=open]:bg-primary",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
          >
            <X />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex w-full flex-col items-center gap-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex w-full flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

function DialogIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-icon"
      className={cn(
        "my-4 flex items-center justify-center",
        "[&_svg]:block [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

interface DialogTitleProps
  extends React.ComponentProps<typeof DialogPrimitive.Title> {
  typography?: Typography;
}

function DialogTitle({
  className,
  typography: type = "h3",
  ...props
}: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        typography(type),
        "text-center break-words text-primary",
        className,
      )}
      style={{ marginTop: 0 }}
      {...props}
    />
  );
}

interface DialogDescriptionProps
  extends React.ComponentProps<typeof DialogPrimitive.Description> {
  typography?: Typography;
}

function DialogDescription({
  className,
  typography: type = "body",
  ...props
}: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        typography(type),
        "text-center font-normal text-secondary",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogIcon,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
