"use client";

import React, { useState } from "react";

import type { IconData, Page, UpdatePageParams } from "@notion-kit/schemas";
import { DropItemsHandler, Tree, TreeItemBase } from "@notion-kit/shadcn";

import { SidebarGroup, SidebarMenuItem } from "../core";
import { DocGroupActions, DocItem } from "./_components";
import { PageItems } from "./_lib";

interface DocListProps {
  group: string;
  title: string;
  pages: PageItems;
  activePage?: string | null;
  defaultIcon?: IconData;
  onSelect?: (page: Page) => void;
  onCreate?: (group: string, parentId?: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, data: UpdatePageParams) => void;
  onItemsDrop?: DropItemsHandler<Page & TreeItemBase>;
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
  onItemsDrop,
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
        <Tree
          indent={8}
          initialState={{ selectedItems: activePage ? [activePage] : [] }}
          rootItemId={group}
          items={pages}
          isItemFolder={() => true}
          onItemsDrop={onItemsDrop}
          renderItem={(item) => (
            <DocItem
              key={item.getId()}
              item={item}
              type="normal"
              defaultIcon={defaultIcon}
              onSelect={onSelect}
              onCreate={onCreate}
              onDuplicate={onDuplicate}
              onUpdate={onUpdate}
            />
          )}
        />
      )}
    </SidebarGroup>
  );
}
