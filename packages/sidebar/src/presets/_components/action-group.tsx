"use client";

import React from "react";
import {
  ArrowUpRight,
  Copy,
  Link,
  MoreHorizontal,
  Plus,
  SquarePen,
  Trash,
} from "lucide-react";

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
  TooltipPreset,
} from "@notion-kit/shadcn";
import { toDateString } from "@notion-kit/utils";

import { RenamePopover } from "./rename-popover";

interface ActionGroupProps {
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

export const ActionGroup: React.FC<ActionGroupProps> = ({
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
}) => {
  const [, copy] = useCopyToClipboard();

  return (
    <div className="ml-auto flex items-center p-0.5">
      <DropdownMenu>
        <TooltipPreset description="Delete, duplicate, and more...">
          <DropdownMenuTrigger asChild>
            <Button
              variant="hint"
              className="ml-auto size-auto p-0.5 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
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
                Icon={<Icon.Unstar className="size-4 fill-icon" />}
                Body="Remove from Favorites"
                onSelect={() => onUpdate({ isFavorite: false })}
              />
            ) : (
              <DropdownMenuItem
                Icon={<Icon.Star className="size-4 fill-icon" />}
                Body="Add to Favorites"
                onSelect={() => onUpdate({ isFavorite: true })}
              />
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              Icon={<Link className="size-4" />}
              Body="Copy link"
              onSelect={() => void copy(pageLink)}
            />
            {type === "normal" && (
              <DropdownMenuItem
                Icon={<Copy className="size-4" />}
                Body="Duplicate"
                onSelect={onDuplicate}
              />
            )}
            <RenamePopover title={title} icon={icon} onChange={onUpdate}>
              <DropdownMenuItem
                Icon={<SquarePen className="size-4" />}
                Body="Rename"
                onSelect={(e) => e.preventDefault()}
              />
            </RenamePopover>
            {type === "normal" && (
              <DropdownMenuItem
                variant="warning"
                Icon={<Trash className="size-4" />}
                Body="Move to Trash"
                onSelect={() => onUpdate({ isArchived: true })}
              />
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              Icon={<ArrowUpRight className="size-4" />}
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
          className="ml-auto size-auto rounded-sm p-0.5 opacity-0 group-hover:opacity-100"
          onClick={onCreate}
        >
          <Plus className="size-4" />
        </Button>
      </TooltipPreset>
    </div>
  );
};
