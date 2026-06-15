import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import type { IconData, UpdatePageParams } from "@notion-kit/schemas";
import { toDateString } from "@notion-kit/utils";

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
  MenuFooter,
  MenuItemAction,
  TooltipPreset,
} from "@/primitives";

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
  const { copy } = useCopyToClipboard();

  return (
    <MenuItemAction className="flex items-center opacity-0 transition-opacity group-hover/doc-item:opacity-100 focus-within:opacity-100">
      <DropdownMenu>
        <TooltipPreset description="Delete, duplicate, and more...">
          <DropdownMenuTrigger
            render={
              <Button
                variant="hint"
                className="size-5"
                aria-label="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon.Dots className="size-3 fill-current" />
              </Button>
            }
          />
        </TooltipPreset>
        <DropdownMenuContent className="w-60" align="start" side="right">
          <DropdownMenuGroup>
            {isFavorite ? (
              <DropdownMenuItem
                icon={<Icon.StarSlash />}
                label="Remove from Favorites"
                onClick={() => onUpdate({ isFavorite: false })}
              />
            ) : (
              <DropdownMenuItem
                icon={<Icon.Star />}
                label="Add to Favorites"
                onClick={() => onUpdate({ isFavorite: true })}
              />
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              icon={<Icon.Link />}
              label="Copy link"
              onClick={() => copy(pageLink)}
            />

            {type === "normal" && (
              <DropdownMenuItem
                icon={<Icon.Duplicate />}
                label="Duplicate"
                onClick={onDuplicate}
              />
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={<Icon.Compose />} label="Rename" />
              <RenamePopover title={title} icon={icon} onChange={onUpdate} />
            </DropdownMenuSub>
            {type === "normal" && (
              <DropdownMenuItem
                variant="warning"
                icon={<Icon.Trash />}
                label="Move to Trash"
                onClick={() => onUpdate({ isArchived: true })}
              />
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              icon={<Icon.ArrowDiagonalUpRight />}
              label="Open in new tab"
              onClick={() => window.open(pageLink)}
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <MenuFooter>
            <div className="w-full">Last edited by: {lastEditedBy}</div>
            <div className="w-full">{toDateString(lastEditedAt)}</div>
          </MenuFooter>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipPreset description="Add a page inside">
        <Button
          variant="hint"
          className="size-5"
          aria-label="Add a page inside"
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
