import * as React from "react";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Button } from "./button";
import * as _Icon from "./icons";
import { Input, type InputProps } from "./input";
import { MenuGroup, MenuItem, MenuLabel } from "./menu";
import { Separator } from "./separator";
import { contentVariants } from "./variants";

type AutocompleteGroupItem<ItemValue> = {
  items: readonly ItemValue[];
};

type AutocompleteRootProps<ItemValue = string> = Omit<
  AutocompletePrimitive.Root.Props<ItemValue>,
  "items"
> & {
  items?: readonly ItemValue[] | readonly AutocompleteGroupItem<ItemValue>[];
};

function Autocomplete<ItemValue = string>({
  ...props
}: AutocompleteRootProps<ItemValue>) {
  const Root = AutocompletePrimitive.Root as React.ComponentType<
    AutocompleteRootProps<ItemValue>
  >;

  return <Root {...props} />;
}

function AutocompleteInputGroup({
  className,
  ...props
}: AutocompletePrimitive.InputGroup.Props) {
  return (
    <AutocompletePrimitive.InputGroup
      data-slot="autocomplete-input-group"
      className={cn("flex min-w-0 items-center", className)}
      {...props}
    />
  );
}

type AutocompleteInputProps = Omit<
  AutocompletePrimitive.Input.Props,
  keyof InputProps | "render"
> &
  Omit<InputProps, "onChange" | "value" | "defaultValue"> & {
  classNames?: {
    wrapper?: string;
  };
};

function AutocompleteInput({
  className,
  classNames,
  search,
  clear,
  onCancel,
  ...props
}: AutocompleteInputProps) {
  return (
    <div
      data-slot="autocomplete-input-wrapper"
      className={cn(
        "flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2",
        classNames?.wrapper,
      )}
    >
      <AutocompletePrimitive.Input
        data-slot="autocomplete-input"
        render={
          <Input
            className={className}
            search={search}
            clear={clear}
            onCancel={onCancel}
          />
        }
        {...props}
      />
    </div>
  );
}

function AutocompleteTrigger({
  className,
  children,
  ...props
}: AutocompletePrimitive.Trigger.Props) {
  return (
    <AutocompletePrimitive.Trigger
      data-slot="autocomplete-trigger"
      className={cn(
        "inline-flex items-center justify-center text-muted outline-none",
        className,
      )}
      {...props}
    >
      {children ?? <Icon.Chevron side="down" className="size-3.5 fill-icon" />}
    </AutocompletePrimitive.Trigger>
  );
}

function AutocompleteClear({ ...props }: AutocompletePrimitive.Clear.Props) {
  return (
    <AutocompletePrimitive.Clear
      data-slot="autocomplete-clear"
      render={
        <Button type="button" variant="close" size="circle">
          <_Icon.Clear />
        </Button>
      }
      {...props}
    />
  );
}

type AutocompletePositionerProps = Pick<
  AutocompletePrimitive.Positioner.Props,
  | "align"
  | "alignOffset"
  | "anchor"
  | "collisionPadding"
  | "side"
  | "sideOffset"
>;

interface AutocompleteContentProps
  extends AutocompletePrimitive.Popup.Props,
    AutocompletePositionerProps {
  variant?: "floating" | "inline";
}

function AutocompleteContent({
  className,
  variant = "floating",
  align = "start",
  side = "bottom",
  sideOffset = 4,
  alignOffset,
  anchor,
  collisionPadding,
  ...props
}: AutocompleteContentProps) {
  const [inlineContainer, setInlineContainer] =
    React.useState<HTMLDivElement | null>(null);

  if (variant === "inline") {
    return (
      <>
        <div ref={setInlineContainer} className="relative z-10 w-full" />
        {inlineContainer && (
          <AutocompletePrimitive.Portal container={inlineContainer}>
            <AutocompletePrimitive.Positioner
              align={align}
              alignOffset={alignOffset}
              anchor={anchor}
              collisionPadding={collisionPadding}
              side={side}
              sideOffset={sideOffset}
              className="relative w-full"
              style={{
                position: "relative",
                inset: "auto",
                transform: "none",
              }}
            >
              <AutocompletePrimitive.Popup
                data-slot="autocomplete-content"
                data-variant={variant}
                className={cn(
                  "group/autocomplete-content relative w-full overflow-hidden rounded-md bg-modal",
                  className,
                )}
                {...props}
              />
            </AutocompletePrimitive.Positioner>
          </AutocompletePrimitive.Portal>
        )}
      </>
    );
  }

  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        className="z-(--z-menu)"
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          data-variant={variant}
          className={cn(
            contentVariants({ variant: "default", openAnimation: true }),
            "group/autocomplete-content max-h-[min(calc(var(--available-height)-8px),300px)] w-(--anchor-width) min-w-(--anchor-width) overflow-hidden rounded-md bg-modal",
            className,
          )}
          {...props}
        />
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  );
}

function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
      className={cn("max-h-75 overflow-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

function AutocompleteGroup({
  className,
  ...props
}: AutocompletePrimitive.Group.Props) {
  return (
    <AutocompletePrimitive.Group
      data-slot="autocomplete-group"
      render={<MenuGroup />}
      className={cn("h-full overflow-auto", className)}
      {...props}
    />
  );
}

interface AutocompleteLabelProps
  extends Omit<
    AutocompletePrimitive.GroupLabel.Props,
    "children" | "render" | "title"
  > {
  title: React.ReactNode;
}

function AutocompleteLabel({ title, ...props }: AutocompleteLabelProps) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-label"
      render={<MenuLabel title={title} />}
      {...props}
    />
  );
}

type AutocompleteItemVisualProps = Pick<
  React.ComponentProps<typeof MenuItem>,
  "className" | "desc" | "icon" | "label" | "variant"
>;

interface AutocompleteItemProps<ItemValue = string>
  extends Omit<
      AutocompletePrimitive.Item.Props,
      "className" | "render" | "value"
    >,
    AutocompleteItemVisualProps {
  value?: ItemValue;
}

function AutocompleteItem<ItemValue = string>({
  className,
  value,
  icon,
  label,
  desc,
  variant,
  children,
  ...props
}: AutocompleteItemProps<ItemValue>) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      value={value}
      render={
        <MenuItem
          className={className}
          icon={icon}
          label={label ?? String(value)}
          desc={desc}
          variant={variant}
        />
      }
      {...props}
    >
      {children}
    </AutocompletePrimitive.Item>
  );
}

function AutocompleteSeparator({
  className,
  ...props
}: AutocompletePrimitive.Separator.Props) {
  return (
    <AutocompletePrimitive.Separator
      data-slot="autocomplete-separator"
      render={<Separator className={className} />}
      {...props}
    />
  );
}

function AutocompleteEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn(
        "min-h-7 items-center p-2 text-sm/tight text-secondary select-none",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteStatus({
  className,
  ...props
}: AutocompletePrimitive.Status.Props) {
  return (
    <AutocompletePrimitive.Status
      data-slot="autocomplete-status"
      className={cn("px-3 py-1 text-xs text-muted", className)}
      {...props}
    />
  );
}

function AutocompleteCollection({
  ...props
}: AutocompletePrimitive.Collection.Props) {
  return (
    <AutocompletePrimitive.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
  AutocompleteStatus,
  AutocompleteTrigger,
};
export type {
  AutocompleteContentProps,
  AutocompleteInputProps,
  AutocompleteItemProps,
  AutocompleteLabelProps,
  AutocompleteRootProps,
};
