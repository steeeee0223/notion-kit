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
    <MenuItemAction className="flex items-center">
      <DropdownMenu>
        <TooltipPreset description="Delete, duplicate, and more...">
          <DropdownMenuTrigger asChild>
            <Button
              variant="hint"
              className="size-5 opacity-0 group-hover/doc-item:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon.Dots className="size-3" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipPreset>
        <DropdownMenuContent
          className="w-60"
          align="start"
          side="right"
          forceMount
          onClick={(e) => e.stopPropagation()}
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
            <RenamePopover title={title} icon={icon} onChange={onUpdate}>
              <DropdownMenuItem
                Icon={<Icon.Compose />}
                Body="Rename"
                onSelect={(e) => e.preventDefault()}
              />
            </RenamePopover>
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
          className="size-5 opacity-0 group-hover/doc-item:opacity-100"
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
