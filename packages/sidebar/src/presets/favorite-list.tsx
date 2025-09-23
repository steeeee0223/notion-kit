"use client";

import React, { useState } from "react";

import type { Page, UpdatePageParams } from "@notion-kit/schemas";
import { TreeItem, TreeList, TreeNode } from "@notion-kit/tree";

import { SidebarGroup, SidebarMenuItem } from "../core";
import { DocItemActions } from "./_components/doc-item-actions";

interface FavoriteListProps {
  pages: TreeNode<Page>[];
  activePage?: string | null;
  onSelect?: (page: Page) => void;
  onCreate?: (group: string, parentId?: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, data: UpdatePageParams) => void;
}

export function FavoriteList({
  pages: nodes,
  activePage,
  onSelect,
  onCreate,
  onDuplicate,
  onUpdate,
}: FavoriteListProps) {
  const [showList, setShowList] = useState(true);

  return (
    <SidebarGroup>
      <SidebarMenuItem
        className="group/doc-list"
        label={<span className="text-xs/none font-medium">Favorites</span>}
        aria-expanded={showList}
        onClick={() => setShowList((prev) => !prev)}
      />
      {showList && (
        <TreeList
          indent={8}
          nodes={nodes}
          defaultIcon={{ type: "lucide", src: "file" }}
          showEmptyChild
          selectedId={activePage}
          renderItem={({ node, ...props }) => (
            <TreeItem
              {...props}
              node={node}
              onSelect={() => onSelect?.(node)}
              className="group/doc-item"
              expandable
            >
              <DocItemActions
                type="normal"
                title={node.title}
                icon={node.icon ?? { type: "lucide", src: "file" }}
                pageLink={node.url ?? "#"}
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
      )}
    </SidebarGroup>
  );
}
