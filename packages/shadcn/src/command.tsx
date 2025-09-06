"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@notion-kit/cn";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import * as Icon from "./icons";
import { inputVariants, menuItemVariants, separatorVariants } from "./variants";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-modal text-primary focus-visible:outline-none",
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
          className="focus-visible:outline-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export interface CommandInputProps
  extends React.ComponentProps<typeof CommandPrimitive.Input> {
  clear?: boolean;
  onCancel?: () => void;
}
function CommandInput({
  className,
  clear,
  onCancel,
  ...props
}: CommandInputProps) {
  const showClear =
    clear &&
    !props.disabled &&
    typeof props.value === "string" &&
    props.value.length > 0;

  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        inputVariants({ variant: "default", size: "lg", className }),
      )}
      cmdk-input-wrapper=""
    >
      <CommandPrimitive.Input
        data-slot="command-input"
        className="block resize-none border-none outline-hidden placeholder:text-default/45 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {showClear && (
        <Button
          type="button"
          variant="close"
          size="circle"
          className="ml-1 focus-visible:shadow-notion"
          aria-label="Clear input"
          onClick={onCancel}
        >
          <Icon.Clear />
        </Button>
      )}
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
      className={cn("overflow-x-hidden overflow-y-auto", className)}
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
      className={cn("py-6 text-center text-sm select-none", className)}
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
        "overflow-hidden py-1 text-muted [&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted",
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
};
