"use client";

import React, { useMemo } from "react";

import { useOrigin } from "@notion-kit/hooks";
import type { Page, UpdatePageParams } from "@notion-kit/schemas";
import {
  buildTree,
  TreeGroup,
  TreeItem,
  TreeList,
  TreeNode,
} from "@notion-kit/tree";

import { ActionGroup } from "./_components";

interface FavoriteListProps {
  pages: Page[];
  activePage?: string | null;
  isLoading?: boolean;
  onSelect?: (page: Page) => void;
  onCreate?: (group: string, parentId: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, data: UpdatePageParams) => void;
}

export const FavoriteList: React.FC<FavoriteListProps> = ({
  pages,
  activePage,
  isLoading,
  onSelect,
  onCreate,
  onDuplicate,
  onUpdate,
}) => {
  const origin = useOrigin();
  const nodes = useMemo(
    () =>
      pages
        .filter((page) => page.isFavorite && !page.isArchived)
        .map<TreeNode<Page>>((fav) => ({
          ...fav,
          parentId: null,
          children: buildTree(pages, fav.id),
        })),
    [pages],
  );

  return (
    <TreeGroup title="Favorites" isLoading={isLoading}>
      <TreeList
        nodes={nodes}
        defaultIcon={{ type: "lucide", src: "file" }}
        selectedId={activePage}
        renderItem={({ node, ...props }) => (
          <TreeItem
            {...props}
            node={node}
            className="group"
            onSelect={() => onSelect?.(node)}
            expandable={node.type === "document"}
          >
            <ActionGroup
              type={node.isFavorite ? "favorites" : "normal"}
              title={node.title}
              icon={node.icon ?? { type: "text", src: node.title }}
              pageLink={node.url ? `${origin}/${node.url}` : "#"}
              isFavorite={node.isFavorite}
              lastEditedBy={node.lastEditedBy}
              lastEditedAt={node.lastEditedAt}
              onCreate={() => onCreate?.(node.type, node.id)}
              onDuplicate={() => onDuplicate?.(node.id)}
              onUpdate={(data) => onUpdate?.(node.id, data)}
            />
          </TreeItem>
        )}
      />
    </TreeGroup>
  );
};
