import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@notion-kit/cn";

import { contentVariants } from "./variants";

type DrawerDirection = "top" | "right" | "bottom" | "left";

function directionToSwipeDirection(direction?: DrawerDirection) {
  if (direction === "top") return "up";
  if (direction === "bottom") return "down";
  return direction;
}

function Drawer({
  direction,
  shouldScaleBackground: _shouldScaleBackground,
  swipeDirection,
  ...props
}: DrawerPrimitive.Root.Props & {
  direction?: DrawerDirection;
  shouldScaleBackground?: boolean;
}) {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      swipeDirection={swipeDirection ?? directionToSwipeDirection(direction)}
      {...props}
    />
  );
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-(--z-menu) bg-black/80 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

interface DrawerContentProps extends DrawerPrimitive.Popup.Props {
  side?: "bottom" | "right";
  noTitle?: boolean;
}
function DrawerContent({
  className,
  children,
  side = "bottom",
  noTitle = false,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerOverlay className="z-0 bg-transparent" />
      <DrawerPrimitive.Viewport className="pointer-events-none fixed inset-0 z-(--z-menu)">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "pointer-events-auto fixed inset-x-0 bottom-0 z-(--z-menu) mt-24 flex flex-col rounded-t-[10px]",
            contentVariants({ variant: "default", openAnimation: false }),
            side === "right" &&
              "inset-y-0 right-0 left-auto mt-0 h-screen rounded-none border-t-0 border-r-0",
            className,
          )}
          {...props}
          {...(noTitle && { "aria-describedby": undefined })}
        >
          <DrawerPrimitive.Content>
            {noTitle && <DrawerTitle className="sr-only" />}
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  type DrawerContentProps,
};
