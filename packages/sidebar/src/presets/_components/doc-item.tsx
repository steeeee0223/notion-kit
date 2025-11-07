import { cn } from "@notion-kit/cn";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import type { IconData, Page, UpdatePageParams } from "@notion-kit/schemas";
import {
  Button,
  MenuItem,
  TreeItem,
  TreeItemBase,
  type ItemInstance,
} from "@notion-kit/shadcn";

import { DocItemActions } from "./doc-item-actions";

interface DocItemProps {
  item: ItemInstance<Page & TreeItemBase>;
  type: "normal" | "favorites";
  defaultIcon?: IconData;
  onSelect?: (page: Page) => void;
  onCreate?: (group: string, parentId?: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, data: UpdatePageParams) => void;
}

export function DocItem({
  item,
  type,
  defaultIcon = { type: "lucide", src: "file" },
  onSelect,
  onCreate,
  onDuplicate,
  onUpdate,
}: DocItemProps) {
  const node = item.getItemData();
  const expandable = item.isFolder();
  const expanded = item.isExpanded();
  return (
    <TreeItem item={item}>
      <MenuItem
        className={cn(
          "group/doc-item",
          "in-focus-visible:shadow-notion in-data-[drag-target=true]:cursor-grabbing in-data-[drag-target=true]:bg-default/10",
          "in-data-[selected=true]:bg-default/10 in-data-[selected=true]:text-primary",
        )}
        variant="sidebar"
        Icon={
          <div className="group/icon">
            <Button
              variant="hint"
              className={cn(
                "relative hidden size-5 shrink-0",
                expandable && "group-hover/icon:flex",
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (expanded) {
                  item.collapse();
                } else {
                  item.expand();
                }
              }}
              aria-label={expanded ? "collapse" : "expand"}
            >
              {expanded ? (
                <Icon.ChevronDown className="size-2.5" />
              ) : (
                <Icon.ChevronRight className="size-2.5" />
              )}
            </Button>
            <IconBlock
              className={cn(expandable && "group-hover/icon:hidden")}
              icon={node.icon ?? defaultIcon}
            />
          </div>
        }
        Body={node.title}
        onClick={() => onSelect?.(node)}
      >
        <DocItemActions
          type={type}
          title={node.title}
          icon={node.icon ?? defaultIcon}
          pageLink={node.url ?? "#"}
          isFavorite={node.isFavorite}
          lastEditedBy={node.lastEditedBy}
          lastEditedAt={node.lastEditedAt}
          onCreate={() => onCreate?.(node.type, node.id)}
          onDuplicate={() => onDuplicate?.(node.id)}
          onUpdate={(data) => onUpdate?.(node.id, data)}
        />
      </MenuItem>
    </TreeItem>
  );
}
