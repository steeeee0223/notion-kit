"use client";

import React, { useCallback, useState } from "react";

import type { IconInfo } from "@notion-kit/icon-block";
import { cn } from "@notion-kit/cn";

import type { TreeItemProps } from "./tree-item";
import type { TreeItemData, TreeNode } from "./types";
import { TreeItem } from "./tree-item";
import { fromNode } from "./types";

interface TreeListProps<T extends TreeItemData> {
  nodes: TreeNode<T>[];
  level?: number;
  defaultIcon?: IconInfo;
  showEmptyChild?: boolean;
  Item?: React.FC<TreeItemProps<T>>;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

function TreeList<T extends TreeItemData>(props: TreeListProps<T>) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const onExpand = (itemId: string) =>
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

  const renderTree = useCallback(
    (
      {
        nodes,
        level = 0,
        defaultIcon,
        showEmptyChild,
        Item = TreeItem,
        selectedId,
        onSelect,
      }: TreeListProps<T>,
      expanded: Record<string, boolean>,
    ) => {
      return (
        <>
          {showEmptyChild && (
            <p
              style={{
                paddingLeft: level ? `${level * 12 + 25}px` : undefined,
              }}
              className={cn(
                "text-muted dark:text-muted-dark hidden pl-4 text-sm font-medium",
                !Object.is(expanded, {}) && "last:block",
                level === 0 && "hidden",
              )}
            >
              No pages inside
            </p>
          )}
          {nodes.map((node) => (
            <div key={node.id}>
              {
                void Item({
                  node: fromNode({ ...node, icon: node.icon ?? defaultIcon }),
                  isSelected: selectedId === node.id,
                  onSelect: () => onSelect?.(node.id),
                  level,
                  expandable: true,
                  expanded: expanded[node.id],
                  onExpand: () => onExpand(node.id),
                })
              }
              {expanded[node.id] && (
                <>
                  {renderTree(
                    {
                      nodes: node.children,
                      level: level + 1,
                      showEmptyChild,
                      defaultIcon,
                      Item,
                      selectedId,
                      onSelect,
                    },
                    expanded,
                  )}
                </>
              )}
            </div>
          ))}
        </>
      );
    },
    [],
  );

  return <>{renderTree(props, expanded)}</>;
}

export { TreeList };
