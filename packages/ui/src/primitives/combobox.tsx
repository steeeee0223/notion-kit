import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Badge } from "./badge";
import { Button } from "./button";
import { popup, positioner } from "./design";
import * as _Icon from "./icons";
import { MenuGroup, MenuItem, MenuItemCheck, MenuLabel } from "./menu";
import { Separator } from "./separator";

type ComboboxAnchorContextValue = React.RefObject<HTMLElement | null> & {
  ref: React.RefCallback<HTMLElement>;
};

const ComboboxAnchorContext =
  React.createContext<ComboboxAnchorContextValue | null>(null);

function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple>,
) {
  const anchor = React.useRef<HTMLElement | null>(null);
  const ctx = React.useMemo<ComboboxAnchorContextValue>(
    () =>
      // eslint-disable-next-line react-hooks/refs
      Object.assign(anchor, {
        ref: (node: HTMLElement | null) => {
          anchor.current = node;
        },
      }),
    [],
  );

  return (
    <ComboboxAnchorContext.Provider value={ctx}>
      <ComboboxPrimitive.Root {...props} />
    </ComboboxAnchorContext.Provider>
  );
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "inline-flex items-center justify-center text-muted outline-none",
        className,
      )}
      {...props}
    >
      {children ?? <Icon.Chevron side="down" className="size-3.5 fill-icon" />}
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={
        <Button type="button" variant="close" size="circle">
          <_Icon.Clear />
        </Button>
      }
      {...props}
    />
  );
}

function ComboboxInput({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Input>) {
  const comboboxAnchor = React.useContext(ComboboxAnchorContext);

  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      ref={comboboxAnchor?.ref}
      className={cn(
        "flex-1 bg-transparent outline-hidden placeholder:text-default/45 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxContent({
  className,
  variant = "floating",
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  anchor,
  style,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "align" | "alignOffset" | "anchor" | "side" | "sideOffset"
  > & {
    variant?: "floating" | "inline";
  }) {
  const comboboxAnchor = React.useContext(ComboboxAnchorContext);

  if (variant === "inline") {
    return (
      <div
        data-slot="combobox-content"
        data-variant={variant}
        className={cn(
          "group/combobox-content relative w-full overflow-hidden",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor ?? comboboxAnchor}
        className={cn(positioner())}
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-variant={variant}
          style={style}
          className={cn(
            popup({ type: "combobox" }),
            "max-h-[min(calc(var(--available-height)-8px),300px)] min-w-(--anchor-width)",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("max-h-75 overflow-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

interface ComboboxItemProps extends ComboboxPrimitive.Item.Props {
  className?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  desc?: string;
  showIndicator?: boolean;
}

function ComboboxItem({
  className,
  value,
  icon,
  label,
  desc,
  showIndicator = true,
  children,
  ...props
}: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      value={value as unknown}
      render={
        <MenuItem
          className={className}
          icon={icon}
          label={label ?? String(value)}
          desc={desc}
        />
      }
      {...props}
    >
      {children}
      {showIndicator && (
        <ComboboxPrimitive.ItemIndicator
          data-slot="combobox-item-indicator"
          render={<MenuItemCheck />}
        />
      )}
    </ComboboxPrimitive.Item>
  );
}

interface ComboboxCreatableItemProps extends ComboboxPrimitive.Item.Props {
  className?: string;
  value: string;
}

function ComboboxCreatableItem({
  className,
  children,
  value,
  ...props
}: ComboboxCreatableItemProps) {
  return (
    <ComboboxItem
      data-slot="combobox-creatable-item"
      className={className}
      value={value}
      label={children ?? `Create "${value}"`}
      {...props}
    />
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      render={<MenuGroup />}
      className={cn("h-full overflow-auto", className)}
      {...props}
    />
  );
}

interface ComboboxLabelProps extends ComboboxPrimitive.GroupLabel.Props {
  title: string;
}

function ComboboxLabel({
  title,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      render={<MenuLabel title={title} />}
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden min-h-7 items-center p-2 text-sm/tight text-secondary select-none",
        "group-data-empty/combobox-content:flex",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({ ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      render={<Separator />}
      {...props}
    />
  );
}

type ComboboxChipsProps = React.ComponentPropsWithRef<
  typeof ComboboxPrimitive.Chips
> &
  ComboboxPrimitive.Chips.Props & {
    variant?: "floating" | "inline";
    hideClearButton?: boolean;
  };

function ComboboxChips({
  className,
  variant = "floating",
  hideClearButton,
  ...props
}: ComboboxChipsProps) {
  const comboboxAnchor = React.useContext(ComboboxAnchorContext);
  const isInline = variant === "inline";

  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      data-variant={variant}
      ref={comboboxAnchor?.ref}
      className={cn(
        "relative min-h-[34px] cursor-text border-border bg-input text-sm transition-[color,box-shadow] outline-none",
        "flex flex-wrap gap-1",
        isInline
          ? "rounded-none border-b p-2"
          : "rounded-md border focus-within:shadow-notion",
        !hideClearButton && "pe-9",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  ...props
}: ComboboxPrimitive.Chip.Props) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      render={<Badge variant="tag" size="md" />}
      className={cn(
        "my-0.5 h-5 max-w-full min-w-0 shrink-0 pr-0 text-sm/tight",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ComboboxPrimitive.ChipRemove
        data-slot="combobox-chip-remove"
        render={<Button variant="hint" />}
        className="size-5 shrink-0"
        aria-label="Remove"
      >
        <Icon.Close className="size-3.5 fill-primary" />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chips-input"
      className={cn(
        "min-w-20 flex-1 bg-transparent outline-hidden placeholder:text-default/45 disabled:cursor-not-allowed",
        "data-[has-chips=true]:ml-1",
        className,
      )}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxChip,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxCreatableItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
export type {
  ComboboxChipsProps,
  ComboboxLabelProps,
  ComboboxItemProps,
  ComboboxCreatableItemProps,
};
