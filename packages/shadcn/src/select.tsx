"use client";

import * as React from "react";
import type { SelectProps } from "@radix-ui/react-select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@notion-kit/cn";

import {
  ButtonVariants,
  buttonVariants,
  contentVariants,
  menuItemVariants,
  separatorVariants,
} from "./variants";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectIcon({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Icon>) {
  return <SelectPrimitive.Icon data-slot="select-icon" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        buttonVariants({ variant: null }),
        "relative mt-3 mb-1 flex h-7 w-full min-w-0 shrink-0 justify-between justify-normal p-2 text-primary",
        "placeholder:text-secondary data-placeholder:text-secondary",
        "[&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="ml-1 h-4 w-4 opacity-45" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>;
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative max-h-96 min-w-[8rem] overflow-hidden",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          contentVariants({ variant: "popover", sideAnimation: true }),
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "py-1",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className)}
      {...props}
    />
  );
}

interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item>,
    ButtonVariants {
  hideCheck?: boolean;
}
function SelectItem({
  className,
  children,
  hideCheck = false,
  disabled,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        menuItemVariants({ disabled, className: "py-1 focus:bg-default/5" }),
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <SelectPrimitive.ItemText asChild>
        <div className="mr-1.5 block min-w-0 flex-auto">{children}</div>
      </SelectPrimitive.ItemText>
      {!hideCheck && (
        <SelectPrimitive.ItemIndicator asChild>
          <div className="ml-auto block min-w-0 shrink-0">
            <Check className="block size-3.5 shrink-0" />
          </div>
        </SelectPrimitive.ItemIndicator>
      )}
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(separatorVariants({ className }))}
      {...props}
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectIcon,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  type SelectProps,
  type SelectContentProps,
};
