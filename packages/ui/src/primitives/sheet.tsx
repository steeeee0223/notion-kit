import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@notion-kit/cn";

import { Button } from "./button";
import * as Icon from "./icons";
import { contentVariants, Typography, typography } from "./variants";

function Sheet<Payload = unknown>({
  ...props
}: SheetPrimitive.Root.Props<Payload>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger<Payload = unknown>({
  ...props
}: SheetPrimitive.Trigger.Props<Payload>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ render, ...props }: SheetPrimitive.Close.Props) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      render={
        render ?? (
          <Button
            type="button"
            variant="close"
            size="circle"
            aria-label="Close"
          >
            <Icon.Close className="h-full w-3.5 fill-secondary dark:fill-default/45" />
            <span className="sr-only">Close</span>
          </Button>
        )
      }
      {...props}
    />
  );
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-(--z-menu) bg-black/50 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

interface SheetContentProps extends SheetPrimitive.Popup.Props {
  side?: "top" | "right" | "bottom" | "left";
  hideClose?: boolean;
  hasOverlay?: boolean;
  container?: SheetPrimitive.Portal.Props["container"];
}

function SheetContent({
  className,
  children,
  side = "right",
  hideClose,
  hasOverlay = true,
  container,

  ...props
}: SheetContentProps) {
  return (
    <SheetPortal container={container}>
      {hasOverlay && <SheetOverlay />}
      <SheetPrimitive.Title className="sr-only" />
      <SheetPrimitive.Description className="sr-only" />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          contentVariants({ variant: "sheet" }),
          "flex flex-col gap-4 transition ease-in-out data-closed:animate-out data-closed:duration-300 data-open:animate-in data-open:duration-300",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-closed:slide-out-to-right data-open:slide-in-from-right sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-closed:slide-out-to-left data-open:slide-in-from-left sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-closed:slide-out-to-top data-open:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-closed:slide-out-to-bottom data-open:slide-in-from-bottom",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <SheetClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-main transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-open:bg-secondary" />
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

interface SheetTitleProps extends SheetPrimitive.Title.Props {
  typography?: Typography;
}

function SheetTitle({
  className,
  typography: type = "h1",
  ...props
}: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        typography(type),
        "wrap-break-word text-primary",
        className,
      )}
      style={{ marginTop: 0 }}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
