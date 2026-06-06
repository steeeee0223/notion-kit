"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { MenuItem, MenuItemCheck } from "./menu";
import {
  buttonVariants,
  contentVariants,
  MenuItemVariants,
  separatorVariants,
} from "./variants";

function Select<Value = string, Multiple extends boolean | undefined = false>({
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
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
  | "align"
  | "alignOffset"
  | "side"
  | "sideOffset"
  | "collisionPadding"
  | "alignItemWithTrigger"
>;

type SelectContentProps = SelectPrimitive.Popup.Props &
  SelectPositionerProps & {
    position?: "popper" | "item-aligned";
  };

function SelectContent({
  className,
  children,
  align,
  alignItemWithTrigger,
  alignOffset,
  collisionPadding,
  position = "popper",
  side,
  sideOffset = 4,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={
          alignItemWithTrigger ?? position === "item-aligned"
        }
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative max-h-96 min-w-32 overflow-hidden",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            contentVariants({ variant: "popover", sideAnimation: true }),
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List
            className={cn(
              "py-1",
              position === "popper" &&
                "h-(--anchor-height) w-full min-w-(--anchor-width)",
            )}
          >
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className)}
      {...props}
    />
  );
}

interface SelectItemProps
  extends Omit<
      SelectPrimitive.Item.Props,
      "children" | "className" | "label" | "render"
    >,
    MenuItemVariants {
  className?: string;
  Icon?: React.ReactNode;
  disabled?: boolean;
  hideCheck?: boolean;
  children?: React.ReactNode;
  label?: string;
}
function SelectItem({
  className,
  children,
  hideCheck = false,
  Icon,
  label,
  disabled,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      disabled={disabled}
      label={label}
      render={
        <MenuItem
          className={cn("py-1 focus:bg-default/5", className)}
          disabled={disabled}
          Icon={Icon}
          Body={<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>}
        >
          {!hideCheck && (
            <SelectPrimitive.ItemIndicator className="ml-2">
              <MenuItemCheck />
            </SelectPrimitive.ItemIndicator>
          )}
        </MenuItem>
      }
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn(separatorVariants({ className }))}
      {...props}
    />
  );
}

interface Option {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectPresetProps<T extends string = string>
  extends Pick<SelectContentProps, "side" | "align"> {
  className?: string;
  /**
   * @prop `options` maps `value` to `Option.value`
   */
  options: Record<T, string | Option>;
  onChange?: (value: T) => void;
  value?: T;
  placeholder?: string;
  disabled?: boolean;
  hideCheck?: boolean;
  renderOption?: React.FC<{ option?: Option | string }>;
}

function SelectPreset<T extends string = string>({
  className,
  options,
  value,
  placeholder,
  side = "bottom",
  align = "end",
  disabled,
  hideCheck,
  onChange,
  renderOption: OptionValue,
}: SelectPresetProps<T>) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange?.(nextValue);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className} onClick={(e) => e.stopPropagation()}>
        <SelectValue
          aria-disabled={disabled}
          placeholder={placeholder}
          {...(OptionValue && {
            "aria-label": value,
            children: (
              <OptionValue option={value ? options[value] : undefined} />
            ),
          })}
        />
      </SelectTrigger>
      <SelectContent position="popper" side={side} align={align}>
        <SelectGroup>
          {Object.entries<string | Option>(options).map(([key, option]) =>
            typeof option === "string" ? (
              <SelectItem value={key} key={key} hideCheck={hideCheck}>
                <div className="flex items-center truncate">{option}</div>
              </SelectItem>
            ) : (
              <SelectItem
                value={key}
                label={option.label}
                key={key}
                hideCheck={hideCheck}
                Icon={option.icon}
              >
                <div className="truncate">{option.label}</div>
                {option.description && (
                  <div className="mt-0.5 overflow-hidden text-xs text-ellipsis whitespace-normal text-secondary">
                    {option.description}
                  </div>
                )}
              </SelectItem>
            ),
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
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
  SelectPreset,
};

export type { Option, SelectPresetProps };
