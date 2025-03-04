"use client";

import type { SelectProps } from "@radix-ui/react-select";
import * as React from "react";
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

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectIcon = SelectPrimitive.Icon;

const SelectTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    className={cn(
      buttonVariants({ variant: "item", size: "sm" }),
      "mt-3 mb-1 h-7 w-full min-w-0 shrink-0 justify-between p-2",
      "placeholder:text-secondary data-placeholder:text-secondary dark:placeholder:text-secondary-dark dark:data-placeholder:text-secondary-dark",
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
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
);
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>;
const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "relative max-h-96 min-w-[8rem] overflow-hidden",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        contentVariants({ variant: "popover" }),
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
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    className={cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className)}
    {...props}
  />
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item>,
    ButtonVariants {
  hideCheck?: boolean;
}
const SelectItem = ({
  className,
  children,
  hideCheck = false,
  disabled,
  ...props
}: SelectItemProps) => (
  <SelectPrimitive.Item
    className={cn(
      menuItemVariants({ disabled, className: "focus:bg-primary/5 py-1" }),
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
SelectItem.displayName = SelectPrimitive.Item.displayName;

type SelectSeparatorProps = React.ComponentProps<
  typeof SelectPrimitive.Separator
>;
const SelectSeparator = ({ className, ...props }: SelectSeparatorProps) => (
  <SelectPrimitive.Separator
    className={cn(separatorVariants({ variant: "default", className }))}
    {...props}
  />
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

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
