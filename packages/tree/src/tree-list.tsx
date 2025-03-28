"use client";

import React, { useCallback, useState } from "react";

import { cn } from "@notion-kit/cn";
import type { IconInfo } from "@notion-kit/icon-block";

import type { TreeItemProps } from "./tree-item";
import { TreeItem } from "./tree-item";
import type { TreeItemData, TreeNode } from "./types";
import { fromNode } from "./utils";

interface TreeListProps<T extends TreeItemData> {
  level?: number;
  nodes: TreeNode<T>[];
  defaultIcon?: IconInfo;
  showEmptyChild?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  Item?: (props: TreeItemProps<T>) => React.ReactNode;
}

type TreeProps<T extends TreeItemData> = TreeListProps<T> & {
  expanded: Record<string, boolean>;
};

function TreeList<T extends TreeItemData>(props: TreeListProps<T>) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const onExpand = (itemId: string) =>
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

  const Tree = useCallback(
    ({
      level = 0,
      nodes,
      defaultIcon,
      showEmptyChild,
      expanded,
      selectedId,
      onSelect,
      Item = TreeItem,
    }: TreeProps<T>) => {
      return (
        <>
          {showEmptyChild && (
            <p
              style={{
                paddingLeft: level ? `${level * 12 + 25}px` : undefined,
              }}
              className={cn(
                "hidden pl-4 text-sm font-medium text-muted",
                !Object.is(expanded, {}) && "last:block",
                level === 0 && "hidden",
              )}
            >
              No pages inside
            </p>
          )}
          {nodes.map((node) => (
            <div key={node.id}>
              {Item({
                level,
                node: fromNode({ ...node, icon: node.icon ?? defaultIcon }),
                isSelected: selectedId === node.id,
                onSelect: () => onSelect?.(node.id),
                expandable: true,
                expanded: expanded[node.id],
                onExpand: () => onExpand(node.id),
              })}
              {expanded[node.id] &&
                Tree({
                  level: level + 1,
                  nodes: node.children,
                  showEmptyChild,
                  defaultIcon,
                  expanded,
                  selectedId,
                  onSelect,
                  Item,
                })}
            </div>
          ))}
        </>
      );
    },
    [],
  );

  return <Tree {...props} expanded={expanded} />;
}

export { TreeList };
