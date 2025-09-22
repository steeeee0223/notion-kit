"use client";

import React from "react";

import { Icon } from "@notion-kit/icons";
import { Button, MenuItemAction, TooltipPreset } from "@notion-kit/shadcn";

interface DocGroupActionsProps {
  onCreate?: () => void;
}

export function DocGroupActions({ onCreate }: DocGroupActionsProps) {
  return (
    <MenuItemAction className="flex items-center">
      <TooltipPreset description="Add a page">
        <Button
          variant="hint"
          className="size-5 opacity-0 group-hover/doc-list:opacity-100 focus-visible:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onCreate?.();
          }}
        >
          <Icon.Plus className="size-3" />
        </Button>
      </TooltipPreset>
    </MenuItemAction>
  );
}
