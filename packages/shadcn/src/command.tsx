"use client";

import * as React from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "@notion-kit/cn";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { MenuItemAction } from "./menu";
import {
  contentVariants,
  InputVariants,
  menuItemVariants,
  separatorVariants,
} from "./variants";

// Context for managing sub-menu state
interface CommandSubContextValue {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "inline" | "floating";
  contentRef: React.RefObject<HTMLDivElement>;
  triggerRef: React.RefObject<HTMLDivElement>;
}

const CommandSubContext = React.createContext<CommandSubContextValue | null>(
  null,
);

function useCommandSubContext() {
  const context = React.useContext(CommandSubContext);
  if (!context) {
    throw new Error(
      "CommandSub components must be used within a CommandSub component",
    );
  }
  return context;
}

// Context for coordinating sibling CommandSubs (same level)
interface CommandSubGroupContextValue {
  openSubId: string | null;
  setOpenSubId: (id: string | null) => void;
}

const CommandSubGroupContext =
  React.createContext<CommandSubGroupContextValue | null>(null);

function useCommandSubGroupContext() {
  return React.useContext(CommandSubGroupContext);
}

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-primary focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  className?: string;
  shouldFilter?: boolean;
  title?: string;
  description?: string;
}
function CommandDialog({
  className,
  shouldFilter,
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0 shadow-lg", className)}
        hideClose
      >
        <Command
          shouldFilter={shouldFilter}
          className="bg-modal focus-visible:outline-hidden [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted **:[[cmdk-input]]:h-12"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export interface CommandInputProps
  extends React.ComponentProps<typeof CommandPrimitive.Input> {
  classNames?: {
    wrapper?: string;
  };
  variant?: InputVariants["variant"];
  search?: boolean;
  clear?: boolean;
  onCancel?: () => void;
}
function CommandInput({
  classNames,
  onValueChange,
  onKeyDown,
  ...props
}: CommandInputProps) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Call original onKeyDown first
      onKeyDown?.(e);

      // Handle CommandSub interactions
      const selectedItem = document.querySelector(
        '[cmdk-item][aria-selected="true"]',
      );

      if (!selectedItem) return;

      // Check if selected item is a CommandSubTrigger
      const subTrigger = selectedItem.closest("[data-command-sub-trigger]");

      if (subTrigger && (e.key === "ArrowRight" || e.key === "Enter")) {
        e.preventDefault();
        e.stopPropagation();

        const subId = subTrigger.getAttribute("data-sub-id");
        if (!subId) return;

        // Trigger the sub to open by clicking
        if (subTrigger instanceof HTMLElement) {
          subTrigger.click();
        }

        // Focus first item in sub-content
        setTimeout(() => {
          const subContent = document.querySelector(
            `[data-command-sub-content][data-sub-id="${subId}"]`,
          );
          const firstItem = subContent?.querySelector("[cmdk-item]");
          if (firstItem instanceof HTMLElement) {
            firstItem.focus();
          }
        }, 10);
        return;
      }

      // Handle closing sub-menu
      if (e.key === "ArrowLeft" || e.key === "Escape") {
        const activeElement = document.activeElement;
        const subContent = activeElement?.closest("[data-command-sub-content]");

        if (subContent) {
          e.preventDefault();
          e.stopPropagation();

          const subId = subContent.getAttribute("data-sub-id");
          const trigger = subId
            ? document.querySelector(
                `[data-command-sub-trigger][data-sub-id="${subId}"]`,
              )
            : null;

          if (trigger instanceof HTMLElement) {
            trigger.click();
          }

          setTimeout(() => {
            const input = document.querySelector("[cmdk-input]");
            if (input instanceof HTMLElement) {
              input.focus();
            }
          }, 10);
        }
      }
    },
    [onKeyDown],
  );

  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2",
        classNames?.wrapper,
      )}
    >
      <CommandPrimitive.Input data-slot="command-input" asChild>
        <Input
          onChange={(e) => onValueChange?.(e.target.value)}
          onCancel={() => onValueChange?.("")}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </CommandPrimitive.Input>
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "overflow-x-hidden overflow-y-auto focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm select-none", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  const [openSubId, setOpenSubId] = React.useState<string | null>(null);
  const groupValue = React.useMemo(
    () => ({ openSubId, setOpenSubId }),
    [openSubId],
  );

  return (
    <CommandSubGroupContext.Provider value={groupValue}>
      <CommandPrimitive.Group
        data-slot="command-group"
        className={cn(
          "overflow-hidden py-1 text-muted **:[[cmdk-group-heading]]:px-3.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted",
          className,
        )}
        {...props}
      />
    </CommandSubGroupContext.Provider>
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(separatorVariants({ className }))}
      {...props}
    />
  );
}

function CommandItem({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        menuItemVariants({ disabled }),
        "aria-selected:bg-default/5 aria-selected:text-primary",
        "data-[disabled=true]:text-muted",
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-muted", className)}
      {...props}
    />
  );
}

/**
 * CommandSub - Container component for creating sub-menus within Command.
 *
 * Works similarly to DropdownMenuSub, providing context for trigger and content.
 * Supports both controlled and uncontrolled state management.
 *
 * @example
 * ```tsx
 * <CommandSub>
 *   <CommandSubTrigger>Settings</CommandSubTrigger>
 *   <CommandSubContent>
 *     <CommandItem>Profile</CommandItem>
 *     <CommandItem>Billing</CommandItem>
 *   </CommandSubContent>
 * </CommandSub>
 * ```
 */
interface CommandSubProps {
  children?: React.ReactNode;
  /** Whether the sub-menu is open by default (uncontrolled) */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

function CommandSub({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CommandSubProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [subIdCounter] = React.useState(() =>
    Math.random().toString(36).substr(2, 9),
  );
  const id = React.useRef(`command-sub-${subIdCounter}`).current;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [variant, setVariant] = React.useState<"inline" | "floating">("inline");

  const groupContext = useCommandSubGroupContext();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const onOpenChange = React.useCallback(
    (newOpen: boolean) => {
      // If opening and variant is floating, close siblings
      if (newOpen && variant === "floating" && groupContext) {
        groupContext.setOpenSubId(id);
      }

      // If closing and this was the open one, clear the group's open ID
      if (!newOpen && groupContext?.openSubId === id) {
        groupContext.setOpenSubId(null);
      }

      setOpen(newOpen);
    },
    [variant, groupContext, id, setOpen],
  );

  // Close if a sibling opens (for floating variant)
  React.useEffect(() => {
    if (
      variant === "floating" &&
      groupContext &&
      groupContext.openSubId !== null &&
      groupContext.openSubId !== id &&
      open
    ) {
      setOpen(false);
    }
  }, [groupContext, id, open, setOpen, variant]);

  const contextValue = React.useMemo(
    () => ({ id, open, onOpenChange, variant, contentRef, triggerRef }),
    [id, open, onOpenChange, variant],
  );

  // Create a new group context for nested CommandSubs
  const [nestedOpenSubId, setNestedOpenSubId] = React.useState<string | null>(
    null,
  );
  const nestedGroupValue = React.useMemo(
    () => ({ openSubId: nestedOpenSubId, setOpenSubId: setNestedOpenSubId }),
    [nestedOpenSubId],
  );

  return (
    <CommandSubContext.Provider value={contextValue}>
      <CommandSubGroupContext.Provider value={nestedGroupValue}>
        {React.Children.map(children, (child) => {
          // Detect variant from CommandSubContent
          if (React.isValidElement(child) && child.type === CommandSubContent) {
            const childVariant = child.props.variant || "inline";
            if (childVariant !== variant) {
              setVariant(childVariant);
            }
          }
          return child;
        })}
      </CommandSubGroupContext.Provider>
    </CommandSubContext.Provider>
  );
}

/**
 * CommandSubTrigger - Trigger button for expanding/collapsing a sub-menu.
 *
 * Automatically includes a chevron icon on the right side.
 * Must be used within a CommandSub component.
 *
 * Keyboard navigation:
 * - ArrowRight: Opens the sub-menu
 * - ArrowLeft: Closes the sub-menu
 * - Enter/Space: Toggles the sub-menu
 */
interface CommandSubTriggerProps
  extends React.ComponentProps<typeof CommandPrimitive.Item> {
  children?: React.ReactNode;
}

function CommandSubTrigger({
  className,
  children,
  onSelect,
  ref,
  ...props
}: CommandSubTriggerProps) {
  const { id, open, onOpenChange } = useCommandSubContext();

  const handleSelect = React.useCallback(
    (value: string) => {
      onOpenChange(!open);
      onSelect?.(value);
    },
    [open, onOpenChange, onSelect],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(true);
      } else if (e.key === "ArrowLeft" && open) {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(false);
      }
    },
    [open, onOpenChange],
  );

  return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-sub-trigger"
      data-command-sub-trigger=""
      data-sub-id={id}
      data-state={open ? "open" : "closed"}
      className={cn(
        menuItemVariants({}),
        "aria-selected:bg-default/5 aria-selected:text-primary",
        "data-[disabled=true]:text-muted",
        className,
      )}
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
      <MenuItemAction>
        <ChevronRightIcon className="size-4 text-icon" />
      </MenuItemAction>
    </CommandPrimitive.Item>
  );
}

/**
 * CommandSubContent - Container for sub-menu items.
 *
 * Conditionally renders children based on the sub-menu's open state.
 * Must be used within a CommandSub component.
 *
 * @variant inline - (default) Renders inline with left padding for hierarchy
 * @variant floating - Renders in a portal with popover positioning, like DropdownMenuSubContent
 */
interface CommandSubContentProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Display variant:
   * - "inline" (default): Content appears inline below the trigger with left padding
   * - "floating": Content appears in a floating popover positioned to the side
   */
  variant?: "inline" | "floating";
  /**
   * Side offset for floating variant (distance from trigger)
   * @default 4
   */
  sideOffset?: number;
  /**
   * Alignment for floating variant
   * @default "start"
   */
  alignOffset?: number;
  ref?: React.Ref<HTMLDivElement>;
}

function CommandSubContent({
  children,
  className,
  variant = "inline",
  sideOffset = 4,
  alignOffset = -4,
  ref,
}: CommandSubContentProps) {
  const { id, open } = useCommandSubContext();
  const triggerRef = React.useRef<HTMLDivElement>(null);

  if (!open) return null;

  if (variant === "floating") {
    return (
      <PopoverPrimitive.Root open={open}>
        <PopoverPrimitive.Anchor ref={triggerRef} />
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            data-slot="command-sub-content"
            data-command-sub-content=""
            data-sub-id={id}
            side="right"
            align="start"
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            className={cn(
              "z-50 min-w-32 overflow-hidden",
              contentVariants({ variant: "popover", sideAnimation: true }),
              className,
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {children}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }

  // Inline variant (default)
  return (
    <div
      ref={ref}
      data-slot="command-sub-content"
      data-command-sub-content=""
      data-sub-id={id}
      className={cn("pl-6", className)}
    >
      {children}
    </div>
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandSub,
  CommandSubTrigger,
  CommandSubContent,
  useCommandState,
};
