"use client";

import React, { useCallback, useState } from "react";

import { cn } from "@notion-kit/cn";
import type { IconData } from "@notion-kit/icon-block";

import type { TreeItemProps } from "./tree-item";
import { TreeItem } from "./tree-item";
import type { TreeItemData, TreeNode } from "./types";
import { fromNode } from "./utils";

interface TreeListProps<T extends TreeItemData> {
  nodes: TreeNode<T>[];
  defaultIcon?: IconData;
  showEmptyChild?: boolean;
  selectedId?: string | null;
  indent?: number;
  onSelect?: (id: string) => void;
  renderItem?: (props: TreeItemProps<T>) => React.ReactNode;
}

interface TreeProps<T extends TreeItemData> extends TreeListProps<T> {
  level?: number;
  expanded: Record<string, boolean>;
}

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
      indent = 12,
      onSelect,
      renderItem = TreeItem,
    }: TreeProps<T>) => {
      return (
        <>
          {showEmptyChild && (
            <p
              style={{
                paddingLeft: level ? `${level * indent + 25}px` : undefined,
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
              {renderItem({
                level,
                node: fromNode({ ...node, icon: node.icon ?? defaultIcon }),
                isSelected: selectedId === node.id,
                onSelect: () => onSelect?.(node.id),
                expandable: true,
                expanded: expanded[node.id],
                indent,
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
                  indent,
                  onSelect,
                  renderItem,
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
