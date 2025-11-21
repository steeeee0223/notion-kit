import React, { useId } from "react";

import { cn } from "@notion-kit/cn";

import * as Icon from "./icons";
import { Label } from "./label";
import { Switch } from "./switch";
import {
  groupVariants,
  menuItemVariants,
  typography,
  type MenuItemVariants,
} from "./variants";

function MenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="menu-group"
      role="group"
      className={cn(groupVariants({ className }))}
      {...props}
    />
  );
}

function MenuLabel({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="menu-label"
      className={cn(
        typography("label"),
        "mt-1.5 mb-2 flex fill-default/45 px-3.5 text-secondary select-none",
        className,
      )}
      title={title}
      {...props}
    >
      <div className="flex self-center">{title}</div>
      {children}
    </div>
  );
}

interface MenuItemProps extends React.ComponentProps<"div">, MenuItemVariants {
  Icon?: React.ReactNode;
  Body?: React.ReactNode;
}

function MenuItem({
  variant,
  disabled,
  className,
  inset,
  Icon,
  Body,
  children,
  ...props
}: MenuItemProps) {
  const iconChildren = React.Children.toArray(Icon);
  return (
    <div
      data-slot="menu-item"
      className={cn(
        menuItemVariants({ variant, disabled, inset }),
        "group/item",
        className,
      )}
      {...props}
      data-disabled={disabled}
      aria-disabled={Boolean(disabled)}
    >
      <div
        data-slot="menu-item-icon"
        className={cn(
          "peer mr-1 flex items-center justify-center empty:hidden [&_svg]:fill-inherit",
          iconChildren.length === 1 && "size-5",
        )}
      >
        {Icon}
      </div>
      <div
        data-slot="menu-item-body"
        className="mx-1.5 min-w-0 flex-auto truncate peer-empty:mx-0"
      >
        {Body}
      </div>
      {children}
    </div>
  );
}

interface MenuItemActionProps extends React.PropsWithChildren {
  className?: string;
}

function MenuItemAction({ className, children }: MenuItemActionProps) {
  return (
    <div
      data-slot="menu-item-action"
      className={cn(
        "ml-auto min-w-0 shrink-0 [&_svg]:block [&_svg]:shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MenuItemCheck() {
  return (
    <MenuItemAction data-slot="menu-item-check" className="w-3.5">
      <svg
        aria-hidden="true"
        role="graphics-symbol"
        viewBox="0 0 16 16"
        key="thinCheck"
        className="size-full fill-primary"
      >
        <path d="M6.385 14.162c.362 0 .642-.15.84-.444L13.652 3.71c.144-.226.205-.417.205-.602 0-.485-.341-.82-.833-.82-.335 0-.54.123-.746.444l-5.926 9.4-3.042-3.903c-.205-.267-.417-.376-.718-.376-.492 0-.848.348-.848.827 0 .212.075.417.253.629l3.541 4.416c.24.3.492.437.848.437z" />
      </svg>
    </MenuItemAction>
  );
}

function MenuItemSelect({ className, children }: MenuItemActionProps) {
  return (
    <MenuItemAction className={cn("flex items-center text-muted", className)}>
      {children}
      <Icon.ChevronDown className="ml-1.5 h-full w-3 -rotate-90 fill-icon transition-[rotate] group-data-[state='open']/item:rotate-0" />
    </MenuItemAction>
  );
}

function MenuItemShortcut({
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <MenuItemAction data-slot="menu-item-shortcut" {...props}>
      <span className="text-xs whitespace-nowrap text-muted">{children}</span>
    </MenuItemAction>
  );
}

interface MenuItemSwitchProps extends MenuItemProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function MenuItemSwitch({
  checked = false,
  onCheckedChange,
  ...props
}: MenuItemSwitchProps) {
  const id = useId();
  return (
    <Label htmlFor={id}>
      <MenuItem {...props}>
        <MenuItemAction>
          <Switch
            id={id}
            size="sm"
            checked={checked}
            onCheckedChange={onCheckedChange}
          />
        </MenuItemAction>
      </MenuItem>
    </Label>
  );
}

export {
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuItemAction,
  MenuItemCheck,
  MenuItemSelect,
  MenuItemShortcut,
  MenuItemSwitch,
};
