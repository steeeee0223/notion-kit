"use client";

import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { SortMenu, TableViewMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const { table } = useTableViewCtx();
  const { menu } = table.getState();
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className={cn("flex items-center justify-end gap-0.5", className)}>
      <ToolbarItem icon={<Icon.FilterSmall />} label="Filter" />
      <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="nav-icon"
              aria-label="Sort"
              title="Sort"
              className="[&_svg]:fill-current"
              onClick={() => setSortOpen((open) => !open)}
            >
              <Icon.ArrowUpDownSmall />
            </Button>
          }
        />
        <DropdownMenuContent
          aria-label="Sort"
          collisionPadding={12}
          className="w-72"
        >
          <SortMenu />
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolbarItem
        icon={<Icon.LightningSmall />}
        label="Create and view automations"
      />
      <ToolbarItem icon={<Icon.MagnifyingGlassSmall />} label="Search" />
      <ToolbarItem
        icon={<Icon.ArrowExpandDiagonalSmall className="rotate-90" />}
        label="Open as full page"
      />
      <DropdownMenu
        open={menu.open}
        onOpenChange={(open) => table.setTableMenuState({ open, page: null })}
      >
        <DropdownMenuTrigger
          render={
            <Button
              variant="nav-icon"
              aria-label="Settings"
              title="Settings"
              className="[&_svg]:fill-current"
              onClick={() =>
                table.setTableMenuState({ open: !menu.open, page: null })
              }
            >
              <Icon.SlidersSmall />
            </Button>
          }
        />
        <DropdownMenuContent
          collisionPadding={12}
          className="w-72"
          aria-labelledby="view-settings"
        >
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
