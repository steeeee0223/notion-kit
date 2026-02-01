"use client";

import * as React from "react";
import { Command as CommandPrimitive, useCommandState } from "cmdk";

import { cn } from "@notion-kit/cn";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { InputVariants, menuItemVariants, separatorVariants } from "./variants";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-primary focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  className?: string;
  shouldFilter?: boolean;
  title?: string;
  description?: string;
}
function CommandDialog({
  className,
  shouldFilter,
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0 shadow-lg", className)}
        hideClose
      >
        <Command
          shouldFilter={shouldFilter}
          className="bg-modal focus-visible:outline-hidden [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted **:[[cmdk-input]]:h-12"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export interface CommandInputProps
  extends React.ComponentProps<typeof CommandPrimitive.Input> {
  classNames?: {
    wrapper?: string;
  };
  variant?: InputVariants["variant"];
  search?: boolean;
  clear?: boolean;
  onCancel?: () => void;
}
function CommandInput({
  classNames,
  onValueChange,
  ...props
}: CommandInputProps) {
  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2",
        classNames?.wrapper,
      )}
    >
      <CommandPrimitive.Input data-slot="command-input" asChild>
        <Input
          onChange={(e) => onValueChange?.(e.target.value)}
          onCancel={() => onValueChange?.("")}
          {...props}
        />
      </CommandPrimitive.Input>
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "overflow-x-hidden overflow-y-auto focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-2 text-center text-sm select-none", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden py-1 text-muted **:[[cmdk-group-heading]]:px-3.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(separatorVariants({ className }))}
      {...props}
    />
  );
}

function CommandItem({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        menuItemVariants({ disabled }),
        "aria-selected:bg-default/5 aria-selected:text-primary",
        "data-[disabled=true]:text-muted",
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-muted", className)}
      {...props}
    />
  );
}

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
  useCommandState,
};
