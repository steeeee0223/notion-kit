"use client";

import { useState } from "react";
import { FolderIcon, FolderOpenIcon } from "lucide-react";

import {
  createOnDropHandler,
  Tree,
  TreeItem,
  TreeItemLabel,
} from "@notion-kit/shadcn";

interface Item {
  name: string;
  children?: string[];
}

const initialItems: Record<string, Item> = {
  company: {
    name: "Company",
    children: ["engineering", "marketing", "operations"],
  },
  engineering: {
    name: "Engineering",
    children: ["frontend", "backend", "platform-team"],
  },
  frontend: { name: "Frontend", children: ["design-system", "web-platform"] },
  "design-system": {
    name: "Design System",
    children: ["components", "tokens", "guidelines"],
  },
  components: { name: "Components" },
  tokens: { name: "Tokens" },
  guidelines: { name: "Guidelines" },
  "web-platform": { name: "Web Platform" },
  backend: { name: "Backend", children: ["apis", "infrastructure"] },
  apis: { name: "APIs" },
  infrastructure: { name: "Infrastructure" },
  "platform-team": { name: "Platform Team" },
  marketing: { name: "Marketing", children: ["content", "seo"] },
  content: { name: "Content" },
  seo: { name: "SEO" },
  operations: { name: "Operations", children: ["hr", "finance"] },
  hr: { name: "HR" },
  finance: { name: "Finance" },
};

export function DndTree() {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <Tree
        indent={20}
        initialState={{
          expandedItems: ["engineering", "frontend", "design-system"],
          selectedItems: ["components"],
        }}
        rootItemId="company"
        items={items}
        onItemsDrop={createOnDropHandler((target, children) =>
          setItems((prev) => {
            const parent = prev[target.getId()];
            if (!parent) return prev;
            return {
              ...prev,
              [target.getId()]: { ...parent, children },
            };
          }),
        )}
        renderItem={(item) => (
          <TreeItem key={item.getId()} item={item}>
            <TreeItemLabel>
              <span className="flex items-center gap-2">
                {item.isFolder() &&
                  (item.isExpanded() ? (
                    <FolderOpenIcon className="size-4 text-menu-icon" />
                  ) : (
                    <FolderIcon className="size-4 text-menu-icon" />
                  ))}
                {item.getItemName()}
              </span>
            </TreeItemLabel>
          </TreeItem>
        )}
      />
      <p aria-live="polite" role="region" className="mt-2 text-xs text-muted">
        Tree with multi-select and drag and drop ∙{" "}
        <a
          href="https://headless-tree.lukasbach.com"
          className="hover:text-foreground underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          API
        </a>
      </p>
    </div>
  );
}
