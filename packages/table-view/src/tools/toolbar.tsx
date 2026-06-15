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

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  return (
    <div className={cn("flex items-center justify-end gap-0.5", className)}>
      <ToolbarItem icon={<Icon.FilterSmall />} label="Filter" />
      <DropdownMenu>
        <DropdownMenuTrigger
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
        <DropdownMenuContent collisionPadding={12} className="w-72">
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
      <DropdownMenu>
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
