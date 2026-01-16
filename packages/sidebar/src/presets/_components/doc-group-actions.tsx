"use client";

import { Icon } from "@notion-kit/icons";
import { Button, MenuItemAction, TooltipPreset } from "@notion-kit/shadcn";

interface DocGroupActionsProps {
  onCreate?: () => void;
}

export function DocGroupActions({ onCreate }: DocGroupActionsProps) {
  return (
    <MenuItemAction className="flex items-center opacity-0 transition-opacity group-hover/doc-list:opacity-100 focus-within:opacity-100">
      <TooltipPreset description="Add a page">
        <Button
          variant="hint"
          className="size-5"
          aria-label="Add a page"
          onClick={(e) => {
            e.stopPropagation();
            onCreate?.();
          }}
        >
          <Icon.Plus className="size-3 fill-current" />
        </Button>
      </TooltipPreset>
    </MenuItemAction>
  );
}
