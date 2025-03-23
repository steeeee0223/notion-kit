"use client";

import * as React from "react";
import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@notion-kit/cn";

import { Dialog, DialogContent } from "./dialog";
import { inputVariants, menuItemVariants, separatorVariants } from "./variants";

type CommandProps = React.ComponentProps<typeof CommandPrimitive>;
const Command = ({ className, ...props }: CommandProps) => (
  <CommandPrimitive
    className={cn(
      "text-popover-foreground bg-modal flex h-full w-full flex-col overflow-hidden rounded-md",
      className,
    )}
    {...props}
  />
);
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps
  extends DialogProps,
    Pick<CommandProps, "shouldFilter"> {
  className?: string;
}
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
          className="dark:text-muted-dark [&_[cmdk-group-heading]]:text-muted focus-visible:outline-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12"
          // [&_[cmdk-group]]:px-2 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input>;
const CommandInput = ({ className, ...props }: CommandInputProps) => (
  <div
    className={cn(
      inputVariants({ variant: "flat" }),
      "border-b px-3",
      className,
    )}
    cmdk-input-wrapper=""
  >
    <CommandPrimitive.Input {...props} />
  </div>
);

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    className={cn("overflow-x-hidden overflow-y-auto", className)}
    {...props}
  />
);

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn(
      "text-muted dark:text-muted-dark [&_[cmdk-group-heading]]:text-muted overflow-hidden py-1 [&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
      className,
    )}
    {...props}
  />
);

CommandGroup.displayName = CommandPrimitive.Group.displayName;

type CommandSeparatorProps = React.ComponentProps<
  typeof CommandPrimitive.Separator
>;
const CommandSeparator = ({ className, ...props }: CommandSeparatorProps) => (
  <CommandPrimitive.Separator
    className={cn(separatorVariants({ variant: "default", className }))}
    {...props}
  />
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

type CommandItemProps = React.ComponentProps<typeof CommandPrimitive.Item>;
const CommandItem = ({ className, disabled, ...props }: CommandItemProps) => (
  <CommandPrimitive.Item
    className={cn(
      menuItemVariants({ disabled }),
      "aria-selected:bg-primary/5 aria-selected:text-primary dark:aria-selected:text-primary/80",
      "data-[disabled=true]:text-muted dark:data-[disabled=true]:text-muted-dark",
      className,
    )}
    disabled={disabled}
    {...props}
  />
);

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "text-muted dark:text-muted-dark ml-auto text-xs tracking-widest",
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
