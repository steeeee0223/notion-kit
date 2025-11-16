"use client";

import React, { useState } from "react";

import type { Page, UpdatePageParams } from "@notion-kit/schemas";
import { Tree } from "@notion-kit/shadcn";

import { SidebarGroup, SidebarMenuItem } from "../core";
import { DocItem } from "./_components";
import type { PageItems } from "./_lib";

const ROOT_ID = "favorites";

interface FavoriteListProps {
  pages: PageItems;
  activePage?: string | null;
  onSelect?: (page: Page) => void;
  onCreate?: (group: string, parentId?: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, data: UpdatePageParams) => void;
}

export function FavoriteList({
  pages,
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
        <Tree
          indent={8}
          state={{ selectedItems: activePage ? [activePage] : [] }}
          rootItemId={ROOT_ID}
          items={pages}
          isItemFolder={() => true}
          renderItem={(item) => (
            <DocItem
              key={item.getId()}
              item={item}
              type="favorites"
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
