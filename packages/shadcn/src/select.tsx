"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@notion-kit/cn";

import * as Icon from "./icons";
import { MenuItem, MenuItemCheck } from "./menu";
import {
  buttonVariants,
  contentVariants,
  MenuItemVariants,
  separatorVariants,
} from "./variants";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectIcon({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Icon>) {
  return <SelectPrimitive.Icon data-slot="select-icon" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
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
      <SelectPrimitive.Icon asChild>
        <Icon.ChevronDown className="ml-auto fill-icon" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <Icon.ChevronDown className="rotate-180" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <Icon.ChevronDown />
    </SelectPrimitive.ScrollDownButton>
  );
}

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>;
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative max-h-96 min-w-32 overflow-hidden",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          contentVariants({ variant: "popover", sideAnimation: true }),
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "py-1",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className)}
      {...props}
    />
  );
}

interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item>,
    MenuItemVariants {
  Icon?: React.ReactNode;
  disabled?: boolean;
  hideCheck?: boolean;
}
function SelectItem({
  className,
  children,
  hideCheck = false,
  Icon,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item asChild data-slot="select-item" {...props}>
      <MenuItem
        role="menuitem"
        className={cn("py-1 focus:bg-default/5", className)}
        Icon={Icon}
        Body={<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>}
      >
        {!hideCheck && (
          <SelectPrimitive.ItemIndicator asChild className="ml-2">
            <MenuItemCheck />
          </SelectPrimitive.ItemIndicator>
        )}
      </MenuItem>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
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
    <Select value={value} onValueChange={onChange} disabled={disabled}>
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
                textValue={key}
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
