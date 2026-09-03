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
  const { table } = useTableViewCtx();
  const { filterMenu, sortMenu } = useMenuCoordinator();
  const tableMenu = table.getTableMenuState();

  return (
    <div
      className={cn(
        "sticky inset-e-0 flex items-center justify-end gap-0.5",
        className,
      )}
    >
      <TooltipPreset description="Filter" side="top">
        <PopoverTrigger
          id={FILTER_MENU_TOOLBAR_TRIGGER_ID}
          handle={filterMenu.handle}
          render={
            <Button
              variant="nav-icon"
              aria-label="Filter"
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
            aria-label="Sort"
            className="[&_svg]:fill-current"
          >
            <Icon.ArrowUpDownSmall />
          </Button>
        }
      />
      <ToolbarItem
        icon={<Icon.LightningSmall />}
        label="Create and view automations"
      />
      <ToolbarSearch />
      <ToolbarItem
        icon={<Icon.ArrowExpandDiagonalSmall className="rotate-90" />}
        label="Open as full page"
      />
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
              aria-label="Settings"
              className="[&_svg]:fill-current"
            >
              <Icon.SlidersSmall />
            </Button>
          }
        />
        <DropdownMenuContent collisionPadding={12} className="w-72">
          <TableViewMenu />
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="blue" size="sm" className="h-7 px-2">
        New
        <Icon.Chevron side="down" className="size-3 fill-current" />
      </Button>
    </div>
  );
}

function ToolbarSearch() {
  const { table } = useTableViewCtx();
  const searchInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex items-center">
      <TooltipPreset description="Search" side="top">
        <Button
          variant="nav-icon"
          aria-label="Search"
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
            aria-label="Search table"
            aria-hidden={!searchOpen}
            tabIndex={searchOpen ? undefined : -1}
            placeholder="Search"
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
