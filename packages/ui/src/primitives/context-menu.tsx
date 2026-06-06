"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { Menu } from "@base-ui/react/menu";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuItemCheck,
  MenuItemShortcut,
  MenuLabel,
} from "./menu";
import { Separator } from "./separator";
import { contentVariants } from "./variants";

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  className,
  ...props
}: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
  );
}

function ContextMenuGroup({ ...props }: Menu.Group.Props) {
  return (
    <Menu.Group
      data-slot="context-menu-group"
      render={<MenuGroup />}
      {...props}
    />
  );
}

function ContextMenuPortal({ ...props }: Menu.Portal.Props) {
  return <Menu.Portal data-slot="context-menu-portal" {...props} />;
}

function ContextMenuSub({ ...props }: Menu.SubmenuRoot.Props) {
  return <Menu.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({ ...props }: Menu.RadioGroup.Props) {
  return <Menu.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

type ContextMenuPositionerProps = Pick<
  Menu.Positioner.Props,
  "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"
>;

type ContextMenuContentProps = Menu.Popup.Props & ContextMenuPositionerProps;

function ContextMenuContent({
  className,
  align,
  alignOffset,
  collisionPadding,
  side,
  sideOffset = 4,
  ...props
}: ContextMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
      >
        <Menu.Popup
          data-slot="context-menu-content"
          className={cn(
            "max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto duration-100",
            contentVariants({ variant: "popover", sideAnimation: true }),
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

type ContextMenuItemProps = React.ComponentProps<typeof MenuItem> &
  Omit<Menu.Item.Props, "children" | "className" | "label" | "render">;
function ContextMenuItem({
  Body,
  Icon,
  className,
  desc,
  disabled,
  variant,
  ...props
}: ContextMenuItemProps) {
  return (
    <Menu.Item
      data-slot="context-menu-item"
      disabled={disabled}
      label={typeof Body === "string" ? Body : undefined}
      render={
        <MenuItem
          Body={Body}
          Icon={Icon}
          className={className}
          desc={desc}
          disabled={disabled}
          variant={variant}
        />
      }
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  Body,
  Icon: ItemIcon,
  className,
  desc,
  disabled,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof MenuItem> &
  Omit<
    Menu.SubmenuTrigger.Props,
    "children" | "className" | "label" | "render"
  >) {
  return (
    <Menu.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      disabled={disabled}
      label={typeof Body === "string" ? Body : undefined}
      render={
        <MenuItem
          Body={Body}
          Icon={ItemIcon}
          className={className}
          desc={desc}
          disabled={disabled}
          variant={variant}
        >
          {children}
          <MenuItemAction>
            <Icon.Chevron
              side="right"
              className="cn-rtl-flip ml-auto fill-icon transition-transform duration-100 focus:rotate-0"
            />
          </MenuItemAction>
        </MenuItem>
      }
      {...props}
    />
  );
}

function ContextMenuSubContent({
  className,
  align,
  alignOffset,
  collisionPadding,
  side,
  sideOffset = 4,
  ...props
}: ContextMenuContentProps) {
  return (
    <Menu.Positioner
      align={align}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      side={side}
      sideOffset={sideOffset}
    >
      <Menu.Popup
        data-slot="context-menu-sub-content"
        className={cn(
          "min-w-32 origin-(--transform-origin) overflow-hidden duration-100",
          contentVariants({ variant: "popover", sideAnimation: true }),
          className,
        )}
        {...props}
      />
    </Menu.Positioner>
  );
}

type ContextMenuCheckboxItemProps = React.ComponentProps<typeof MenuItem> &
  Omit<Menu.CheckboxItem.Props, "children" | "className" | "label" | "render">;
function ContextMenuCheckboxItem({
  Body,
  Icon,
  className,
  desc,
  disabled,
  variant,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <Menu.CheckboxItem
      data-slot="context-menu-checkbox-item"
      disabled={disabled}
      label={typeof Body === "string" ? Body : undefined}
      render={
        <MenuItem
          Body={Body}
          Icon={Icon}
          className={className}
          desc={desc}
          disabled={disabled}
          variant={variant}
        >
          {children}
          <Menu.CheckboxItemIndicator>
            <MenuItemCheck />
          </Menu.CheckboxItemIndicator>
        </MenuItem>
      }
      {...props}
    />
  );
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: Menu.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <Menu.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <Menu.RadioItemIndicator>
          <Icon.Check />
        </Menu.RadioItemIndicator>
      </span>
      {children}
    </Menu.RadioItem>
  );
}

function ContextMenuLabel({ ...props }: Menu.GroupLabel.Props) {
  return (
    <Menu.GroupLabel
      data-slot="context-menu-label"
      render={<MenuLabel />}
      {...props}
    />
  );
}

function ContextMenuSeparator({ className, ...props }: Menu.Separator.Props) {
  return (
    <Menu.Separator
      data-slot="context-menu-separator"
      render={<Separator className={cn("m-0", className)} />}
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
