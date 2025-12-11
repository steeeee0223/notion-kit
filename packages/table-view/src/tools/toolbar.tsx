"use client";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { TableViewMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const { table } = useTableViewCtx();
  const { menu } = table.getState();

  return (
    <div className={cn("flex items-center justify-end gap-0.5", className)}>
      <ToolbarItem icon={<Icon.FilterSmall />} label="Filter" />
      <ToolbarItem icon={<Icon.ArrowUpDownSmall />} label="Sort" />
      <ToolbarItem
        icon={<Icon.LightningSmall />}
        label="Create and view automations"
      />
      <ToolbarItem icon={<Icon.MagnifyingGlassSmall />} label="Search" />
      <Popover
        open={menu.open}
        onOpenChange={(open) => table.setTableMenuState({ open, page: null })}
      >
        <TooltipPreset description="Settings" side="top">
          <PopoverTrigger asChild>
            <Button
              variant="nav-icon"
              aria-label="Settings"
              className="[&_svg]:fill-current"
            >
              {<Icon.SlidersSmall />}
            </Button>
          </PopoverTrigger>
        </TooltipPreset>
        <PopoverContent className="z-990" collisionPadding={12} sticky="always">
          <TableViewMenu />
        </PopoverContent>
      </Popover>
      <Button variant="blue" size="sm" className="h-7 px-2">
        New
        <Icon.ChevronDown className="size-3 fill-current" />
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
