"use client";

import { useState } from "react";

import { TreeGroup, TreeList } from "@notion-kit/tree";

import { CustomItem } from "./custom-item";
import { folderNodes } from "./data";

export default function Custom() {
  const [activeFile, setActiveFile] = useState<string | null>(null);

  return (
    <TreeGroup
      className="w-60 bg-sidebar p-2"
      title="Workspace"
      description="Add a file"
    >
      <TreeList
        nodes={folderNodes}
        defaultIcon={{ type: "lucide", name: "file-text" }}
        selectedId={activeFile}
        onSelect={setActiveFile}
        showEmptyChild
        renderItem={({ node, isSelected, onSelect, ...props }) => (
          <CustomItem
            {...props}
            id={node.id}
            label={node.title}
            icon={node.icon}
            active={isSelected}
            onClick={onSelect}
          />
        )}
      />
    </TreeGroup>
  );
}
