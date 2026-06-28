import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { Menu } from "@base-ui/react/menu";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { popup, positioner } from "./design";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuItemCheck,
  MenuItemShortcut,
  MenuLabel,
} from "./menu";
import { Separator } from "./separator";
import type { MenuItemVariants } from "./variants";

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
        className={cn(positioner())}
      >
        <Menu.Popup
          data-slot="context-menu-content"
          className={cn(popup({ type: "contextMenu" }), className)}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

interface ContextMenuItemProps
  extends Omit<Menu.Item.Props, "className" | "label" | "render"> {
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  desc?: string;
  variant?: MenuItemVariants["variant"];
}
function ContextMenuItem({
  className,
  label,
  icon,
  desc,
  variant,
  ...props
}: ContextMenuItemProps) {
  return (
    <Menu.Item
      data-slot="context-menu-item"
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem
          label={label}
          icon={icon}
          className={className}
          desc={desc}
          variant={variant}
        />
      }
      {...props}
    />
  );
}

interface ContextMenuSubTriggerProps
  extends Omit<Menu.SubmenuTrigger.Props, "className" | "label" | "render"> {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  desc?: string;
  variant?: MenuItemVariants["variant"];
  children?: React.ReactNode;
}

function ContextMenuSubTrigger({
  className,
  label,
  icon,
  desc,
  variant,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <Menu.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem
          label={label}
          icon={icon}
          className={className}
          desc={desc}
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
      className={cn(positioner())}
    >
      <Menu.Popup
        data-slot="context-menu-sub-content"
        className={cn(popup({ type: "contextMenu" }), className)}
        {...props}
      />
    </Menu.Positioner>
  );
}

interface ContextMenuCheckboxItemProps
  extends Omit<
    Menu.CheckboxItem.Props,
    "children" | "className" | "label" | "render"
  > {
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  desc?: string;
  variant?: MenuItemVariants["variant"];
  children?: React.ReactNode;
}

function ContextMenuCheckboxItem({
  className,
  label,
  icon,
  desc,
  variant,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <Menu.CheckboxItem
      data-slot="context-menu-checkbox-item"
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem
          label={label}
          icon={icon}
          className={className}
          desc={desc}
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
  ...props
}: Menu.RadioItem.Props) {
  return (
    <Menu.RadioItem
      data-slot="context-menu-radio-item"
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

interface ContextMenuLabelProps extends Menu.GroupLabel.Props {
  title: string;
}

function ContextMenuLabel({ title, ...props }: ContextMenuLabelProps) {
  return (
    <Menu.GroupLabel
      data-slot="context-menu-label"
      render={<MenuLabel title={title} />}
      {...props}
    />
  );
}

function ContextMenuSeparator({ className, ...props }: Menu.Separator.Props) {
  return (
    <Menu.Separator
      data-slot="context-menu-separator"
      render={<Separator className={className} />}
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
