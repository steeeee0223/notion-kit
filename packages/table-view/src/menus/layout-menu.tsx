"use client";

import { cn } from "@notion-kit/cn";
import { Button, MenuGroup } from "@notion-kit/shadcn";

import { LayoutIcon, MenuHeader } from "../common";
import { LAYOUT_OPTIONS } from "../features";
import { useTableViewCtx } from "../table-contexts";

export function LayoutMenu() {
  const { table } = useTableViewCtx();
  const { layout: currentLayout } = table.getTableGlobalState();

  return (
    <>
      <MenuHeader
        title="Layout"
        onBack={() => table.setTableMenuState({ open: true, page: null })}
      />
      <MenuGroup>
        <div className="grid grid-cols-3 gap-2 p-2 pb-0">
          {LAYOUT_OPTIONS.map((layout) => (
            <Button
              key={layout.value}
              aria-selected={currentLayout === layout.value}
              onClick={() => table.setTableLayout(layout.value)}
              className={cn(
                "flex flex-col gap-0 p-1.5 text-xs text-secondary [&_svg]:my-1 [&_svg]:fill-current",
                "aria-selected:text-blue aria-selected:shadow-notion",
              )}
              // TODO Not all layouts are implemented yet
              disabled={layout.value !== "table" && layout.value !== "list"}
            >
              <LayoutIcon layout={layout.value} />
              <div className="text-center">{layout.label}</div>
            </Button>
          ))}
        </div>
      </MenuGroup>
    </>
  );
}
