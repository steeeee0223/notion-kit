"use client";

import React, { useState } from "react";

import type { IconData, Page, UpdatePageParams } from "@notion-kit/schemas";
import { TreeItem, TreeList, TreeNode } from "@notion-kit/tree";

import { SidebarGroup, SidebarMenuItem } from "../core";
import { DocGroupActions } from "./_components";
import { DocItemActions } from "./_components/doc-item-actions";

interface DocListProps {
  group: string;
  title: string;
  pages: TreeNode<Page>[];
  activePage?: string | null;
  defaultIcon?: IconData;
  onSelect?: (page: Page) => void;
  onCreate?: (group: string, parentId?: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, data: UpdatePageParams) => void;
}

export function DocList({
  group,
  title,
  pages: nodes,
  activePage,
  defaultIcon = { type: "lucide", src: "file" },
  onSelect,
  onCreate,
  onDuplicate,
  onUpdate,
}: DocListProps) {
  const [showList, setShowList] = useState(true);

  return (
    <SidebarGroup>
      <SidebarMenuItem
        className="group/doc-list"
        label={<span className="text-xs/none font-medium">{title}</span>}
        aria-expanded={showList}
        onClick={() => setShowList((prev) => !prev)}
      >
        <DocGroupActions onCreate={() => onCreate?.(group)} />
      </SidebarMenuItem>
      {showList && (
        <TreeList
          nodes={nodes}
          defaultIcon={defaultIcon}
          showEmptyChild={group === "document"}
          selectedId={activePage}
          renderItem={({ node, ...props }) => (
            <TreeItem
              {...props}
              node={node}
              onSelect={() => onSelect?.(node)}
              className="group/doc-item"
              expandable={group === "document"}
            >
              <DocItemActions
                type="normal"
                title={node.title}
                icon={node.icon ?? defaultIcon}
                pageLink={node.url ?? "#"}
                isFavorite={node.isFavorite}
                lastEditedBy={node.lastEditedBy}
                lastEditedAt={node.lastEditedAt}
                onCreate={() => onCreate?.(group, node.id)}
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
