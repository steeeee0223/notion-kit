"use client";

import React from "react";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import type { IconData, UpdatePageParams } from "@notion-kit/schemas";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuItemAction,
  TooltipPreset,
} from "@notion-kit/shadcn";
import { toDateString } from "@notion-kit/utils";

import { RenamePopover } from "./rename-popover";

interface DocItemActionsProps {
  type: "normal" | "favorites";
  title: string;
  icon: IconData;
  pageLink: string;
  isFavorite: boolean;
  lastEditedBy: string;
  lastEditedAt: number;
  onCreate?: () => void;
  onDuplicate?: () => void;
  onUpdate: (data: UpdatePageParams) => void;
}

export function DocItemActions({
  type,
  title,
  icon,
  pageLink,
  isFavorite,
  lastEditedBy,
  lastEditedAt,
  onCreate,
  onDuplicate,
  onUpdate,
}: DocItemActionsProps) {
  const [, copy] = useCopyToClipboard();

  return (
    <MenuItemAction className="flex items-center opacity-0 transition-opacity group-hover/doc-item:opacity-100 focus-within:opacity-100">
      <DropdownMenu>
        <TooltipPreset description="Delete, duplicate, and more...">
          <DropdownMenuTrigger asChild>
            <Button
              variant="hint"
              className="size-5"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon.Dots className="size-3 fill-secondary" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipPreset>
        <DropdownMenuContent
          className="w-60"
          align="start"
          side="right"
          forceMount
        >
          <DropdownMenuGroup>
            {isFavorite ? (
              <DropdownMenuItem
                Icon={<Icon.StarSlash />}
                Body="Remove from Favorites"
                onSelect={() => onUpdate({ isFavorite: false })}
              />
            ) : (
              <DropdownMenuItem
                Icon={<Icon.Star />}
                Body="Add to Favorites"
                onSelect={() => onUpdate({ isFavorite: true })}
              />
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              Icon={<Icon.Link />}
              Body="Copy link"
              onSelect={() => void copy(pageLink)}
            />
            {type === "normal" && (
              <DropdownMenuItem
                Icon={<Icon.Duplicate />}
                Body="Duplicate"
                onSelect={onDuplicate}
              />
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger Icon={<Icon.Compose />} Body="Rename" />
              <RenamePopover title={title} icon={icon} onChange={onUpdate} />
            </DropdownMenuSub>
            {type === "normal" && (
              <DropdownMenuItem
                variant="warning"
                Icon={<Icon.Trash />}
                Body="Move to Trash"
                onSelect={() => onUpdate({ isArchived: true })}
              />
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              Icon={<Icon.ArrowDiagonalUpRight />}
              Body="Open in new tab"
              onSelect={() => window.open(pageLink)}
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <div className="flex flex-col items-center p-2 text-xs text-muted">
            <div className="w-full">Last edited by: {lastEditedBy}</div>
            <div className="w-full">{toDateString(lastEditedAt)}</div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipPreset description="Add a page inside">
        <Button
          variant="hint"
          className="size-5"
          onClick={(e) => {
            e.stopPropagation();
            onCreate?.();
          }}
        >
          <Icon.Plus className="size-3 fill-secondary" />
        </Button>
      </TooltipPreset>
    </MenuItemAction>
  );
}
