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

import { Hint } from "@notion-kit/common";
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
        <Hint description="Delete, duplicate, and more...">
          <DropdownMenuTrigger asChild>
            <Button
              variant="hint"
              className="ml-auto size-auto p-0.5 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </Hint>
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
                onSelect={() => onUpdate({ isFavorite: false })}
              >
                <Icon.Unstar className="dark:fill-icon-dark mr-2 size-4 fill-icon" />
                Remove from Favorites
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => onUpdate({ isFavorite: true })}>
                <Icon.Star className="dark:fill-icon-dark mr-2 size-4 fill-icon" />
                Add to Favorites
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => void copy(pageLink)}>
              <Link className="mr-2 size-4" />
              Copy link
            </DropdownMenuItem>
            {type === "normal" && (
              <DropdownMenuItem onSelect={onDuplicate}>
                <Copy className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
            )}
            <RenamePopover title={title} icon={icon} onChange={onUpdate}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <SquarePen className="mr-2 size-4" />
                Rename
              </DropdownMenuItem>
            </RenamePopover>
            {type === "normal" && (
              <DropdownMenuItem
                variant="warning"
                onSelect={() => onUpdate({ isArchived: true })}
              >
                <Trash className="mr-2 size-4" />
                Move to Trash
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => window.open(pageLink)}>
              <ArrowUpRight className="mr-2 size-4" />
              Open in new tab
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <div className="flex flex-col items-center p-2 text-xs text-muted">
            <div className="w-full">Last edited by: {lastEditedBy}</div>
            <div className="w-full">{toDateString(lastEditedAt)}</div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <Hint description="Add a page inside">
        <Button
          variant="hint"
          className="ml-auto size-auto rounded-sm p-0.5 opacity-0 group-hover:opacity-100"
          onClick={onCreate}
        >
          <Plus className="size-4" />
        </Button>
      </Hint>
    </div>
  );
};
