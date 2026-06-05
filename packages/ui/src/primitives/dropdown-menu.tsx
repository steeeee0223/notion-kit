import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { ChevronRightIcon, DotFilledIcon } from "@radix-ui/react-icons";

import { cn } from "@notion-kit/cn";

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

function DropdownMenu({ ...props }: Menu.Root.Props) {
  return <Menu.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: Menu.Portal.Props) {
  return <Menu.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: Menu.Trigger.Props) {
  return <Menu.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuGroup({ ...props }: Menu.Group.Props) {
  return (
    <Menu.Group
      data-slot="dropdown-menu-group"
      render={<MenuGroup />}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: Menu.SubmenuRoot.Props) {
  return <Menu.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

type MenuItemVisualProps = Pick<
  React.ComponentProps<typeof MenuItem>,
  "className" | "variant" | "disabled" | "inset" | "desc"
>;

interface DropdownMenuSubTriggerProps
  extends Omit<
      Menu.SubmenuTrigger.Props,
      "children" | "className" | "disabled" | "label" | "render"
    >,
    MenuItemVisualProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

function DropdownMenuSubTrigger({
  icon,
  label,
  children,
  className,
  desc,
  disabled,
  inset,
  variant,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <Menu.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      disabled={disabled ?? undefined}
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem
          Body={label}
          Icon={icon}
          className={className}
          desc={desc}
          disabled={disabled}
          inset={inset}
          variant={variant}
        >
          {children}
          <MenuItemAction>
            <ChevronRightIcon className="size-4 text-icon" />
          </MenuItemAction>
        </MenuItem>
      }
      {...props}
    />
  );
}

type DropdownMenuPositionerProps = Pick<
  Menu.Positioner.Props,
  "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"
>;

function DropdownMenuSubContent({
  className,
  align,
  alignOffset,
  collisionPadding,
  side,
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) {
  return (
    <Menu.Positioner
      align={align}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      side={side}
      sideOffset={sideOffset}
    >
      <Menu.Popup
        data-slot="dropdown-menu-sub-content"
        className={cn(
          "min-w-32 overflow-hidden",
          contentVariants({ variant: "popover", sideAnimation: true }),
          className,
        )}
        {...props}
      />
    </Menu.Positioner>
  );
}

type DropdownMenuContentProps = Menu.Popup.Props & DropdownMenuPositionerProps;

function DropdownMenuContent({
  className,
  align,
  alignOffset,
  collisionPadding,
  side,
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) {
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
          data-slot="dropdown-menu-content"
          className={cn(
            "min-w-32 overflow-hidden",
            contentVariants({ variant: "popover", sideAnimation: true }),
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

interface DropdownMenuItemProps
  extends Omit<
      Menu.Item.Props,
      "children" | "className" | "disabled" | "label" | "render"
    >,
    MenuItemVisualProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

function DropdownMenuItem({
  icon,
  label,
  children,
  className,
  desc,
  disabled,
  inset,
  variant,
  ...props
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      disabled={disabled ?? undefined}
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem
          Body={label}
          Icon={icon}
          className={className}
          desc={desc}
          disabled={disabled}
          inset={inset}
          variant={variant}
        >
          {children}
        </MenuItem>
      }
      {...props}
    />
  );
}

interface DropdownMenuCheckboxItemProps
  extends Omit<
      Menu.CheckboxItem.Props,
      "children" | "className" | "disabled" | "label" | "render"
    >,
    MenuItemVisualProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

function DropdownMenuCheckboxItem({
  icon,
  label,
  children,
  className,
  desc,
  disabled,
  inset,
  variant,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <Menu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      disabled={disabled ?? undefined}
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem
          Body={label}
          Icon={icon}
          className={className}
          desc={desc}
          disabled={disabled}
          inset={inset}
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

function DropdownMenuRadioGroup({ ...props }: Menu.RadioGroup.Props) {
  return <Menu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: Menu.RadioItem.Props) {
  return (
    <Menu.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <Menu.RadioItemIndicator>
          <DotFilledIcon className="size-4 fill-current" />
        </Menu.RadioItemIndicator>
      </span>
      {children}
    </Menu.RadioItem>
  );
}

function DropdownMenuLabel({ ...props }: Menu.GroupLabel.Props) {
  return (
    <Menu.GroupLabel
      data-slot="dropdown-menu-label"
      render={<MenuLabel />}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: Menu.Separator.Props) {
  return (
    <Menu.Separator
      data-slot="dropdown-menu-separator"
      render={<Separator className={className} />}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  ...props
}: React.ComponentProps<typeof MenuItemShortcut>) {
  return <MenuItemShortcut data-slot="dropdown-menu-shortcut" {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
