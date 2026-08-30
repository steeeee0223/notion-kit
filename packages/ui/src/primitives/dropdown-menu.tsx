import * as React from "react";
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
import { Switch } from "./switch";

function DropdownMenu({ ...props }: Menu.Root.Props) {
  return <Menu.Root data-slot="dropdown-menu" {...props} />;
}

DropdownMenu.createHandle = Menu.createHandle;

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
  "className" | "variant" | "icon" | "desc"
>;

interface DropdownMenuSubTriggerProps
  extends Omit<
      Menu.SubmenuTrigger.Props,
      "children" | "className" | "label" | "render"
    >,
    MenuItemVisualProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  chevron?: boolean;
}

function DropdownMenuSubTrigger({
  className,
  variant,
  icon,
  label,
  desc,
  chevron = true,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <Menu.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
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
          {chevron && (
            <MenuItemAction>
              <Icon.Chevron
                side="right"
                className="ml-1.5 h-full w-3 fill-icon transition-[rotate] group-aria-expanded/item:rotate-90"
              />
            </MenuItemAction>
          )}
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
        className={cn(positioner())}
      >
        <Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(popup({ type: "dropdownMenu" }), className)}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

interface DropdownMenuItemProps
  extends Omit<Menu.Item.Props, "className" | "label" | "render">,
    MenuItemVisualProps {
  label?: React.ReactNode;
}

function DropdownMenuItem({
  icon,
  label,
  children,
  className,
  desc,
  variant,
  ...props
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      label={typeof label === "string" ? label : undefined}
      render={
        <MenuItem
          label={label}
          icon={icon}
          desc={desc}
          variant={variant}
          className={className}
        >
          {children}
        </MenuItem>
      }
      {...props}
    />
  );
}

interface DropdownMenuCheckboxItemProps
  extends Omit<Menu.CheckboxItem.Props, "className" | "label" | "render">,
    MenuItemVisualProps {
  label?: React.ReactNode;
  checkType?: "check" | "switch";
}

function DropdownMenuCheckboxItem({
  icon,
  label,
  children,
  className,
  desc,
  variant,
  checkType = "check",
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <Menu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
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
          {checkType === "switch" ? (
            <MenuItemAction>
              <Switch
                size="sm"
                checked={props.checked}
                disabled={props.disabled}
              />
            </MenuItemAction>
          ) : (
            <Menu.CheckboxItemIndicator render={<MenuItemCheck />} />
          )}
        </MenuItem>
      }
      {...props}
    />
  );
}

function DropdownMenuRadioGroup({ ...props }: Menu.RadioGroup.Props) {
  return (
    <Menu.RadioGroup
      data-slot="dropdown-menu-radio-group"
      render={<MenuGroup />}
      {...props}
    />
  );
}

interface DropdownMenuRadioItemProps
  extends Omit<Menu.RadioItem.Props, "className" | "render">,
    MenuItemVisualProps {}

function DropdownMenuRadioItem({
  className,
  variant,
  icon,
  label,
  desc,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <Menu.RadioItem
      data-slot="dropdown-menu-radio-item"
      label={label}
      render={
        <MenuItem
          className={className}
          variant={variant}
          icon={icon}
          label={label}
          desc={desc}
        >
          {children}
          <Menu.RadioItemIndicator render={<MenuItemCheck />} />
        </MenuItem>
      }
      {...props}
    />
  );
}

interface DropdownMenuLabelProps extends Menu.GroupLabel.Props {
  title: string;
}

function DropdownMenuLabel({ title, ...props }: DropdownMenuLabelProps) {
  return (
    <Menu.GroupLabel
      data-slot="dropdown-menu-label"
      render={<MenuLabel title={title} />}
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
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
export type DropdownMenuHandle<Payload = unknown> = Menu.Handle<Payload>;
