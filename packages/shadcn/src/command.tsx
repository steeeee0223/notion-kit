"use client";

import type { DialogProps } from "@radix-ui/react-dialog";
import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@notion-kit/cn";

import { Dialog, DialogContent } from "./dialog";
import { inputVariants, menuItemVariants, separatorVariants } from "./variants";

type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;
const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  CommandProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md bg-modal",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps
  extends DialogProps,
    Pick<CommandProps, "shouldFilter"> {
  className?: string;
}
/** @version 1.5 */
const CommandDialog = ({
  className,
  shouldFilter,
  children,
  ...props
}: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn("overflow-hidden p-0 shadow-lg", className)}
        noTitle
        hideClose
      >
        <Command
          shouldFilter={shouldFilter}
          className="focus-visible:outline-none dark:text-muted-dark [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12"
          // [&_[cmdk-group]]:px-2 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

type CommandInputProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
>;
/** @version 1.5 */
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      inputVariants({ variant: "flat" }),
      "border-b px-3",
      className,
    )}
    cmdk-input-wrapper=""
  >
    <CommandPrimitive.Input ref={ref} {...props} />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden py-1 text-muted dark:text-muted-dark [&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

type CommandSeparatorProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;
const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn(separatorVariants({ variant: "default", className }))}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

type CommandItemProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
>;
/** @version 1.5 */
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, disabled, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      menuItemVariants({ disabled }),
      "aria-selected:bg-primary/5 aria-selected:text-primary dark:aria-selected:text-primary/80",
      "data-[disabled=true]:text-muted data-[disabled=true]:dark:text-muted-dark",
      className,
    )}
    disabled={disabled}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted dark:text-muted-dark",
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
