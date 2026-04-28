"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";

import { cn } from "@notion-kit/cn";

import * as Icon from "./icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuItemCheck,
  MenuItemShortcut,
  MenuLabel,
} from "./menu";
import { contentVariants, separatorVariants } from "./variants";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group asChild>
      <MenuGroup data-slot="context-menu-group" {...props} />
    </ContextMenuPrimitive.Group>
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  side,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        data-side={side}
        className={cn(
          "max-h-(--radix-context-menu-content-available-height) min-w-36 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto duration-100",
          contentVariants({ variant: "popover", sideAnimation: true }),
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

type ContextMenuItemProps = React.ComponentProps<typeof MenuItem> &
  Pick<ContextMenuPrimitive.ContextMenuItemProps, "onSelect">;
function ContextMenuItem({ onSelect, ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item onSelect={onSelect} asChild>
      <MenuItem data-slot="context-menu-item" {...props} />
    </ContextMenuPrimitive.Item>
  );
}

function ContextMenuSubTrigger({
  ...props
}: React.ComponentProps<
  typeof ContextMenuPrimitive.SubTrigger & typeof MenuItem
>) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      asChild
    >
      <MenuItem {...props}>
        <MenuItemAction>
          <Icon.ChevronDown className="cn-rtl-flip ml-auto -rotate-90 fill-icon transition-transform duration-100 focus:rotate-0" />
        </MenuItemAction>
      </MenuItem>
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-hidden duration-100",
        contentVariants({ variant: "popover", sideAnimation: true }),
        className,
      )}
      {...props}
    />
  );
}

type ContextMenuCheckboxItemProps = React.ComponentProps<typeof MenuItem> &
  Pick<
    ContextMenuPrimitive.ContextMenuCheckboxItemProps,
    "checked" | "onCheckedChange"
  >;
function ContextMenuCheckboxItem({
  checked,
  onCheckedChange,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      asChild
      data-slot="context-menu-checkbox-item"
      checked={checked}
      onCheckedChange={onCheckedChange}
    >
      <MenuItem {...props}>
        <ContextMenuPrimitive.ItemIndicator>
          <MenuItemCheck />
        </ContextMenuPrimitive.ItemIndicator>
      </MenuItem>
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.ItemIndicator>
          <Icon.Check />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label>) {
  return (
    <ContextMenuPrimitive.Label data-slot="context-menu-label" asChild>
      <MenuLabel {...props} />
    </ContextMenuPrimitive.Label>
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(separatorVariants({ className: "m-0" }), className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  ...props
}: React.ComponentProps<typeof MenuItemShortcut>) {
  return <MenuItemShortcut data-slot="context-menu-shortcut" {...props} />;
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
