"use client";

import { useState } from "react";

import type { IconData, Page, UpdatePageParams } from "@notion-kit/schemas";
import { MenuItem } from "@notion-kit/shadcn";
import { Tree, useTree } from "@notion-kit/tree";

import { SidebarGroup, SidebarMenuItem } from "../core";
import { DocGroupActions, DocIcon, DocItemActions } from "./_components";
import type { TreeData } from "./_lib";

interface DocListProps {
  group: string;
  title: string;
  pages: Page[];
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
  pages,
  activePage,
  defaultIcon = { type: "lucide", src: "file" },
  onSelect,
  onCreate,
  onDuplicate,
  onUpdate,
}: DocListProps) {
  const [showList, setShowList] = useState(true);

  const treeData = pages.map((page) => ({
    ...page,
    iconData: page.icon ?? defaultIcon,
  }));

  const tree = useTree(treeData, {
    showEmptyChild: true,
    collapsible: true,
    initialSelected: activePage ? [activePage] : [],
    onSelectionChange: (id) =>
      onSelect?.(pages.find((page) => page.id === id)!),
  });

  return (
    <SidebarGroup>
      <SidebarMenuItem
        className="group/doc-list"
        label={<span className="text-xs/none font-medium">{title}</span>}
        aria-expanded={showList}
        onClick={() => setShowList((v) => !v)}
      >
        <DocGroupActions onCreate={() => onCreate?.(group)} />
      </SidebarMenuItem>
      {showList && (
        <Tree tree={tree}>
          <Tree.List<TreeData>
            nodeIds={tree.entity.rootIds}
            renderItem={({ node }) => {
              return (
                <MenuItem
                  variant="sidebar"
                  className="group/doc-item focus:shadow-notion"
                  Icon={<DocIcon node={node} defaultIcon={defaultIcon} />}
                  Body={node.title}
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
                </MenuItem>
              );
            }}
          />
        </Tree>
      )}
    </SidebarGroup>
  );
}
