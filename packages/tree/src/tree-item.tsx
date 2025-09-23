"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Button, MenuItem } from "@notion-kit/shadcn";

import type { TreeItemData } from "./types";

export interface TreeItemProps<T extends TreeItemData>
  extends React.PropsWithChildren {
  node: T;
  level?: number;
  className?: string;
  expandable?: boolean;
  expanded?: boolean;
  isSelected?: boolean;
  indent?: number;
  onExpand?: () => void;
  onSelect?: () => void;
}

function TreeItem<T extends TreeItemData>({
  node,
  level = 0,
  className,
  expandable,
  expanded,
  isSelected,
  indent = 12,
  children,
  onExpand,
  onSelect,
}: TreeItemProps<T>) {
  return (
    <MenuItem
      role="treeitem"
      data-slot="tree-item"
      variant="sidebar"
      id={node.id}
      tabIndex={0}
      aria-label={node.title}
      onClick={onSelect}
      onKeyDown={onSelect}
      style={{ paddingLeft: `${(level + 1) * indent}px` }}
      className={className}
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={isSelected}
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
              onExpand?.();
            }}
            aria-label={expanded ? "collapse" : "expand"}
          >
            <Icon.ChevronDown
              className={cn(
                "size-3 rotate-0 transition-[rotate]",
                !expanded && "-rotate-90",
              )}
            />
          </Button>
          <IconBlock
            className={cn(expandable && "group-hover/icon:hidden")}
            icon={node.icon ?? { type: "text", src: node.title }}
          />
        </div>
      }
      Body={node.title}
    >
      {children}
    </MenuItem>
  );
}

export { TreeItem };
