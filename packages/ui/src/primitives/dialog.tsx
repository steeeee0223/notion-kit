import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@notion-kit/cn";

import { CloseButton } from "./button";
import { popup } from "./design";
import { typography, type Typography } from "./variants";

function Dialog<Payload = unknown>({
  ...props
}: DialogPrimitive.Root.Props<Payload>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger<Payload = unknown>({
  ...props
}: DialogPrimitive.Trigger.Props<Payload>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      render={<CloseButton />}
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-(--z-menu) bg-black/50",
        "data-open:animate-in data-open:fade-in-0",
        "data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}
interface DialogContentProps extends DialogPrimitive.Popup.Props {
  hideClose?: boolean;
  noTitle?: boolean;
  container?: DialogPrimitive.Portal.Props["container"];
}
function DialogContent({
  className,
  children,
  container,
  hideClose = false,
  noTitle,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal container={container}>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(popup({ type: "dialog" }), className)}
        {...props}
        {...(noTitle && { "aria-describedby": undefined })}
      >
        {noTitle && <DialogTitle className="sr-only" />}
        {children}
        {!hideClose && <DialogClose className={cn("absolute top-4 right-4")} />}
      </DialogPrimitive.Popup>
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

interface DialogTitleProps extends DialogPrimitive.Title.Props {
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
        "text-center wrap-break-word text-primary",
        className,
      )}
      style={{ marginTop: 0 }}
      {...props}
    />
  );
}

interface DialogDescriptionProps extends DialogPrimitive.Description.Props {
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
