import { useId, useRef, useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { TableViewMenu } from "@/menus";
import { useTableViewMessages } from "@/messages";
import {
  FILTER_MENU_TOOLBAR_TRIGGER_ID,
  SORT_MENU_TOOLBAR_TRIGGER_ID,
  useMenuCoordinator,
  useTableViewCtx,
} from "@/table-contexts";

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe selector={(state) => state.menu}>
      {() => <ToolbarContent className={className} />}
    </table.Subscribe>
  );
}

function ToolbarContent({ className }: ToolbarProps) {
  const settingsRef = useRef<HTMLButtonElement>(null);
  const { table, readOnly, onNewRow } = useTableViewCtx();
  const { filterMenu, sortMenu } = useMenuCoordinator();
  const tableMenu = table.getTableMenuState();
  const messages = useTableViewMessages();
  const canShowNewRow = !readOnly.hideNewButton;

  return (
    <div className={cn("flex items-center justify-end gap-0.5", className)}>
      <TooltipPreset description={messages.toolbar.filter} side="top">
        <PopoverTrigger
          id={FILTER_MENU_TOOLBAR_TRIGGER_ID}
          handle={filterMenu.handle}
          render={
            <Button
              variant="nav-icon"
              aria-label={messages.toolbar.filter}
              className="[&_svg]:fill-current"
            >
              <Icon.FilterSmall />
            </Button>
          }
        />
      </TooltipPreset>
      <DropdownMenuTrigger
        id={SORT_MENU_TOOLBAR_TRIGGER_ID}
        handle={sortMenu.handle}
        render={
          <Button
            variant="nav-icon"
            aria-label={messages.toolbar.sort}
            className="[&_svg]:fill-current"
          >
            <Icon.ArrowUpDownSmall />
          </Button>
        }
      />
      {/* Automations and full page have no action yet; a read-only table
          does not offer them. */}
      {!readOnly.locked && (
        <ToolbarItem
          icon={<Icon.LightningSmall />}
          label={messages.toolbar.automations}
        />
      )}
      <ToolbarSearch />
      {!readOnly.locked && (
        <ToolbarItem
          icon={<Icon.ArrowExpandDiagonalSmall className="rotate-90" />}
          label={messages.toolbar.openFullPage}
        />
      )}
      {!readOnly.hideViewSettings && (
        <DropdownMenu
          open={tableMenu.open}
          onOpenChange={(open) =>
            table.setTableMenuState({
              open,
              page: open ? tableMenu.page : null,
            })
          }
        >
          <DropdownMenuTrigger
            render={
              <Button
                variant="nav-icon"
                aria-label={messages.toolbar.settings}
                ref={settingsRef}
                className="[&_svg]:fill-current"
              >
                <Icon.SlidersSmall />
              </Button>
            }
          />
          <DropdownMenuContent collisionPadding={12} className="w-72">
            <TableViewMenu getReturnFocus={() => settingsRef.current} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {canShowNewRow && (
        <Button
          variant="blue"
          size="sm"
          className="h-7 px-2"
          onClick={() => (onNewRow ? onNewRow(table) : table.addRow())}
        >
          {messages.toolbar.newRow}
          <Icon.Chevron side="down" className="size-3 fill-current" />
        </Button>
      )}
    </div>
  );
}

function ToolbarSearch() {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();
  const searchInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex items-center">
      <TooltipPreset description={messages.toolbar.search} side="top">
        <Button
          variant="nav-icon"
          aria-label={messages.toolbar.search}
          aria-controls={searchInputId}
          aria-expanded={searchOpen}
          className="[&_svg]:fill-current"
          onClick={() => {
            setSearchOpen(!searchOpen);
            if (!searchOpen) inputRef.current?.focus();
          }}
        >
          <Icon.MagnifyingGlassSmall />
        </Button>
      </TooltipPreset>
      <table.Subscribe selector={(state) => String(state.globalFilter ?? "")}>
        {(globalFilter) => (
          <Input
            ref={inputRef}
            id={searchInputId}
            clear={searchOpen}
            variant="flat"
            className={cn(
              "transition-[width,opacity] duration-200 ease-in-out",
              searchOpen ? "w-[150px] opacity-100" : "w-0 p-0 opacity-0",
            )}
            aria-label={messages.toolbar.searchInputLabel}
            aria-hidden={!searchOpen}
            tabIndex={searchOpen ? undefined : -1}
            placeholder={messages.toolbar.searchPlaceholder}
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            onCancel={table.resetGlobalFilter}
          />
        )}
      </table.Subscribe>
    </div>
  );
}

interface ToolbarItemProps {
  icon: React.ReactNode;
  label: string;
}

function ToolbarItem({ icon, label }: ToolbarItemProps) {
  return (
    <TooltipPreset description={label} side="top">
      <Button
        variant="nav-icon"
        aria-label={label}
        className="[&_svg]:fill-current"
      >
        {icon}
      </Button>
    </TooltipPreset>
  );
}
