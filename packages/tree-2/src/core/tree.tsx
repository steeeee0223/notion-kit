"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Roving from "@radix-ui/react-roving-focus";
import { Slot } from "@radix-ui/react-slot";

import { TreeIndexes, TreeInstance, TreeNode } from "./types";
import { createTreeNavigation } from "./utils";

interface TreeOptions {
  selectionMode?: "single" | "multiple";
  collapsible?: boolean;
  onSelectionChange?: (ids: Set<string>) => void;
  onExpandedChange?: (ids: Set<string>) => void;
}

function buildTreeIndex(
  nodes: TreeNode[],
  expanded: Set<string>,
  parentId: string | null = null,
  acc: TreeIndexes = {
    visibleIds: [],
    parentMap: new Map(),
    childrenMap: new Map(),
  },
) {
  for (const node of nodes) {
    acc.visibleIds.push(node.id);
    acc.parentMap.set(node.id, parentId);
    acc.childrenMap.set(node.id, node.children?.map((c) => c.id) ?? []);

    if (node.children && expanded.has(node.id)) {
      buildTreeIndex(node.children, expanded, node.id, acc);
    }
  }
  return acc;
}

function useTree(data: TreeNode[], options: TreeOptions = {}) {
  const {
    selectionMode = "single",
    collapsible = true,
    onSelectionChange,
    onExpandedChange,
  } = options;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const itemRefs = useRef(new Map<string, HTMLElement>());

  const registerItem = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const focusItem = useCallback((id: string) => {
    itemRefs.current.get(id)?.focus();
  }, []);

  const expand = useCallback(
    (id: string) => {
      if (!collapsible) return;
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        onExpandedChange?.(next);
        return next;
      });
    },
    [collapsible, onExpandedChange],
  );

  const select = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = selectionMode === "single" ? new Set([id]) : new Set(prev);

        if (selectionMode === "multiple") {
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }

        onSelectionChange?.(next);
        return next;
      });
    },
    [selectionMode, onSelectionChange],
  );

  const indexes = useMemo(
    () => buildTreeIndex(data, expanded),
    [data, expanded],
  );

  return {
    indexes,
    expanded,
    selected,
    collapsible,
    expand,
    select,
    registerItem,
    focusItem,
  } satisfies TreeInstance;
}

const TreeContext = createContext<TreeInstance | null>(null);
function useTreeContext() {
  const ctx = use(TreeContext);
  if (!ctx) {
    throw new Error("`useTreeContext` must be used inside `Tree`");
  }
  return ctx;
}

interface TreeProps
  extends React.RefAttributes<HTMLDivElement>,
    React.PropsWithChildren {
  asChild?: boolean;
  tree: TreeInstance;
}

function Tree({ tree, ...props }: TreeProps) {
  return (
    <TreeContext value={tree}>
      <Roving.Root role="tree" orientation="vertical" {...props} />
    </TreeContext>
  );
}

interface TreeItemProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  id: string;
  /**
   * @prop The hierarchical level of the tree item (1-based index).
   */
  level: number;
  hasChildren?: boolean;
  expanded?: boolean;
}

Tree.Item = function TreeItem({
  asChild,
  id,
  level,
  hasChildren,
  expanded,
  ...props
}: TreeItemProps) {
  const Comp = asChild ? Slot : "div";
  const tree = useTreeContext();
  const nav = createTreeNavigation(id, tree);

  return (
    <Roving.Item asChild>
      <Comp
        role="treeitem"
        ref={(el) => tree.registerItem(id, el)}
        id={id}
        aria-level={level}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={tree.selected.has(id)}
        tabIndex={-1}
        onClick={() => tree.select(id)}
        onKeyDown={nav.onKeyDown}
        {...props}
      />
    </Roving.Item>
  );
};

interface TreeExpandIndicatorProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
  onToggle?: () => void;
}

Tree.ExpandIndicator = function TreeExpandIndicator({
  asChild,
  onToggle,
  ...props
}: TreeExpandIndicatorProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      aria-hidden
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      {...props}
    />
  );
};

interface TreeGroupProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

Tree.Group = function TreeGroup({ asChild, ...props }: TreeGroupProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp role="group" {...props} />;
};

export { Tree, useTree, useTreeContext };
export type { TreeOptions, TreeProps, TreeItemProps, TreeGroupProps };
