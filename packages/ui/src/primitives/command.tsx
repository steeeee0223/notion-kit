import * as React from "react";

import { cn } from "@notion-kit/cn";

import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
  type AutocompleteInputProps,
  type AutocompleteItemProps,
  type AutocompleteRootProps,
} from "./autocomplete";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { MenuItemShortcut } from "./menu";

interface CommandDialogProps<ItemValue = string>
  extends React.ComponentProps<typeof Dialog>,
    Pick<
      AutocompleteRootProps<ItemValue>,
      "items" | "itemToStringValue" | "filter" | "filteredItems"
    > {
  className?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

function CommandDialog<ItemValue = string>({
  className,
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  items,
  itemToStringValue,
  filter,
  filteredItems,
  ...props
}: CommandDialogProps<ItemValue>) {
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
        <Autocomplete
          items={items}
          itemToStringValue={itemToStringValue}
          filter={filter}
          filteredItems={filteredItems}
          open
          autoHighlight="always"
          openOnInputClick
        >
          <AutocompleteContent
            data-slot="command"
            variant="inline"
            className="flex size-full flex-col overflow-hidden rounded-md bg-modal text-primary focus-visible:outline-none"
          >
            {children}
          </AutocompleteContent>
        </Autocomplete>
      </DialogContent>
    </Dialog>
  );
}

type CommandInputProps = AutocompleteInputProps;

function CommandInput({ classNames, ...props }: CommandInputProps) {
  return (
    <AutocompleteInput
      data-slot="command-input"
      classNames={{
        wrapper: cn(
          "flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2",
          classNames?.wrapper,
        ),
      }}
      {...props}
    />
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteList>) {
  return (
    <AutocompleteList
      data-slot="command-list"
      className={cn(
        "overflow-x-hidden overflow-y-auto focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CommandCollection({
  ...props
}: React.ComponentProps<typeof AutocompleteCollection>) {
  return <AutocompleteCollection data-slot="command-collection" {...props} />;
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteEmpty>) {
  return (
    <AutocompleteEmpty
      data-slot="command-empty"
      className={cn("py-2 text-center text-sm select-none", className)}
      {...props}
    />
  );
}

interface CommandGroupProps
  extends Omit<React.ComponentProps<typeof AutocompleteGroup>, "heading"> {
  heading?: React.ReactNode;
}

function CommandGroup({ heading, children, ...props }: CommandGroupProps) {
  return (
    <AutocompleteGroup data-slot="command-group" {...props}>
      {heading ? <AutocompleteLabel title={heading} /> : null}
      {children}
    </AutocompleteGroup>
  );
}

interface CommandItemProps<ItemValue = string>
  extends AutocompleteItemProps<ItemValue> {
  shortcut?: React.ReactNode;
}

function CommandItem<ItemValue = string>({
  children,
  shortcut,
  ...props
}: CommandItemProps<ItemValue>) {
  return (
    <AutocompleteItem data-slot="command-item" {...props}>
      {children}
      {shortcut ? <CommandShortcut>{shortcut}</CommandShortcut> : null}
    </AutocompleteItem>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<typeof MenuItemShortcut>) {
  return (
    <MenuItemShortcut
      data-slot="command-shortcut"
      className={cn("text-xs tracking-widest", className)}
      {...props}
    />
  );
}

function CommandSeparator({
  ...props
}: React.ComponentProps<typeof AutocompleteSeparator>) {
  return <AutocompleteSeparator data-slot="command-separator" {...props} />;
}

export {
  CommandCollection,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
export type { CommandDialogProps, CommandInputProps, CommandItemProps };
