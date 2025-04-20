"use client";

import React, { useMemo } from "react";

import { useOrigin } from "@notion-kit/hooks";
import type { IconData, Page, UpdatePageParams } from "@notion-kit/schemas";
import { buildTree, TreeGroup, TreeItem, TreeList } from "@notion-kit/tree";

import { ActionGroup } from "./_components";

interface DocListProps {
  group: string;
  title: string;
  pages: Page[];
  activePage?: string | null;
  defaultIcon?: IconData;
  isLoading?: boolean;
  onSelect?: (page: Page) => void;
  onCreate?: (group: string, parentId?: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: (id: string, data: UpdatePageParams) => void;
}

export const DocList: React.FC<DocListProps> = ({
  group,
  title,
  pages,
  activePage,
  defaultIcon = { type: "lucide", src: "file" },
  isLoading,
  onSelect,
  onCreate,
  onDuplicate,
  onUpdate,
}) => {
  const origin = useOrigin();
  const nodes = useMemo(() => buildTree(pages), [pages]);

  return (
    <TreeGroup
      title={title}
      description={`Add a ${group}`}
      isLoading={isLoading}
      onCreate={() => onCreate?.(group)}
    >
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
            className="group"
            expandable={group === "document"}
          >
            <ActionGroup
              type="normal"
              title={node.title}
              icon={node.icon ?? defaultIcon}
              pageLink={node.url ? `${origin}/${node.url}` : "#"}
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
    </TreeGroup>
  );
};
