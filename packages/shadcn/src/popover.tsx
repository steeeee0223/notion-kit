"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "@notion-kit/cn";

import { Button } from "./button";
import * as Icon from "./icons";
import { contentVariants } from "./variants";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return (
    <PopoverPrimitive.Close data-slot="popover-close" asChild>
      <Button variant="close" size="circle" {...props}>
        <Icon.Close className="h-full w-3.5 fill-secondary dark:fill-default/45" />
      </Button>
    </PopoverPrimitive.Close>
  );
}

type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
> & {
  container?: Element | DocumentFragment | null;
};
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  container,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "w-72 p-0 outline-hidden",
          contentVariants({ variant: "popover", sideAnimation: true }),
          className,
        )}
        /**
         * tmporary fix
         * @see https://github.com/radix-ui/primitives/issues/1241
         */
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.body.style.pointerEvents = "";
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverClose, PopoverContent, PopoverAnchor };
