import React from "react";

import {
  ColumnInfo,
  DEFAULT_PLUGINS,
  useTableViewCtx,
} from "@notion-kit/table-view";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { mockProps } from "./database";

interface PluginsToolbarProps {
  contentClassName: string;
  renderContent: (info: ColumnInfo) => React.ReactNode;
}

export function PluginsToolbar({
  contentClassName,
  renderContent,
}: PluginsToolbarProps) {
  const { table } = useTableViewCtx();

  return (
    <div className="grid size-fit grid-cols-5 items-center gap-2">
      {DEFAULT_PLUGINS.map((plugin) => {
        const column = mockProps.find((prop) => prop.type === plugin.id);
        if (!column) return;
        return (
          <DropdownMenu key={plugin.id}>
            <TooltipPreset description={plugin.meta.name}>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="nav-icon"
                    aria-label={plugin.meta.name}
                    className="size-8 [&_svg]:size-4 [&_svg]:fill-current"
                  >
                    {plugin.meta.icon}
                  </Button>
                }
              />
            </TooltipPreset>
            <DropdownMenuContent
              collisionPadding={12}
              className={contentClassName}
            >
              {renderContent(table.getColumnInfo(column.id))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
