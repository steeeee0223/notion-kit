import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { popup, positioner } from "./design";
import { MenuGroup, MenuItem, MenuItemCheck, MenuLabel } from "./menu";
import { Separator } from "./separator";
import { buttonVariants, type MenuItemVariants } from "./variants";

function Select<Value = string, Multiple extends boolean | undefined = false>({
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      render={<MenuGroup />}
      {...props}
    />
  );
}

function SelectValue({ ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectIcon({ ...props }: SelectPrimitive.Icon.Props) {
  return <SelectPrimitive.Icon data-slot="select-icon" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        buttonVariants({ variant: null }),
        "relative flex h-7 w-full min-w-0 shrink-0 justify-normal p-2 text-primary",
        "focus-within:shadow-notion disabled:opacity-30",
        "placeholder:text-secondary data-placeholder:text-secondary",
        "[&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <Icon.Chevron side="down" className="ml-auto fill-icon" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: SelectPrimitive.ScrollUpArrow.Props) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <Icon.Chevron side="up" className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: SelectPrimitive.ScrollDownArrow.Props) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <Icon.Chevron side="down" className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

type SelectPositionerProps = Pick<
  SelectPrimitive.Positioner.Props,
  "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"
>;

type SelectContentProps = SelectPrimitive.Popup.Props & SelectPositionerProps;

function SelectContent({
  className,
  children,
  align,
  alignOffset,
  collisionPadding,
  side,
  sideOffset = 4,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        className={cn(positioner())}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(popup({ type: "select" }), className)}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List data-slot="select-list">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

interface SelectLabelProps extends SelectPrimitive.GroupLabel.Props {
  title: string;
}

function SelectLabel({ title, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      render={<MenuLabel title={title} />}
      {...props}
    />
  );
}

interface SelectItemProps
  extends
    Omit<SelectPrimitive.Item.Props, "className" | "render">,
    MenuItemVariants {
  className?: string;
  icon?: React.ReactNode;
  desc?: string;
  hideCheck?: boolean;
}
function SelectItem({
  className,
  hideCheck = false,
  icon,
  label,
  desc,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      label={label}
      render={
        <MenuItem className={className} icon={icon} label={label} desc={desc}>
          {!hideCheck && (
            <SelectPrimitive.ItemIndicator
              data-slot="select-item-indicator"
              render={<MenuItemCheck />}
            />
          )}
        </MenuItem>
      }
      {...props}
    />
  );
}

function SelectSeparator({ ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      render={<Separator />}
      {...props}
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectIcon,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
