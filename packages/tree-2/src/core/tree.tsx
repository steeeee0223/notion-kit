"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Slot } from "@radix-ui/react-slot";

import type { TreeInstance, TreeItemData, TreeNode } from "./types";
import { buildTree, createTreeNavigation } from "./utils";

interface TreeOptions {
  selectionMode?: "single" | "multiple";
  collapsible?: boolean;
  indent?: number;
  showEmptyChild?: boolean;
  onSelectionChange?: (ids: Set<string>) => void;
  onExpandedChange?: (ids: Set<string>) => void;
}

function useTree<T extends TreeItemData>(
  data: TreeNode<T>[],
  options: TreeOptions = {},
) {
  const {
    indent = 12,
    showEmptyChild = false,
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
    const el = itemRefs.current.get(id);
    el?.focus();
  }, []);

  const expand = useCallback(
    (id: string) => {
      if (!collapsible) return;
      setExpanded((v) => {
        const next = new Set(v);
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
      setSelected((v) => {
        const next = new Set(selectionMode === "single" ? [id] : v);

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

  const entity = useMemo(() => buildTree(data, expanded), [data, expanded]);

  return {
    indent,
    showEmptyChild,
    original: data,
    entity,
    expanded,
    selected,
    collapsible,
    expand,
    select,
    registerItem,
    focusItem,
  } satisfies TreeInstance<T>;
}

const TreeContext = createContext<TreeInstance<TreeItemData> | null>(null);
function useTreeContext<T extends TreeItemData>() {
  const ctx = use(TreeContext);
  if (!ctx) {
    throw new Error("`useTreeContext` must be used inside `Tree`");
  }
  return ctx as TreeInstance<T>;
}

interface TreeProps<T extends TreeItemData>
  extends React.RefAttributes<HTMLDivElement>,
    React.PropsWithChildren {
  asChild?: boolean;
  tree: TreeInstance<T>;
}

function Tree<T extends TreeItemData>({ tree, ...props }: TreeProps<T>) {
  return (
    <TreeContext value={tree}>
      <div role="tree" {...props} />
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
  children,
  ...props
}: TreeItemProps) {
  const Comp = asChild ? Slot : "div";
  const tree = useTreeContext();
  const nav = createTreeNavigation(id, tree);

  return (
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
    >
      {asChild ? children : tree.entity.nodes.get(id)?.title}
    </Comp>
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
interface DivSlotProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

Tree.Group = function TreeGroup({ asChild, ...props }: DivSlotProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp role="group" {...props} />;
};

Tree.EmptyIndicator = function TreeEmptyIndicator({
  asChild,
  children,
  ...props
}: DivSlotProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp {...props}>{asChild ? children : "No items"}</Comp>;
};

interface TreeListProps<T extends TreeItemData> {
  nodes: TreeNode<T>[];
  level?: number;
  renderItem?: (props: {
    node: TreeNode<T>;
    tree: TreeInstance<T>;
    level: number;
    expanded: boolean;
  }) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

Tree.List = function TreeList<T extends TreeItemData>({
  nodes,
  level = 1,
  renderItem,
  renderEmpty,
}: TreeListProps<T>) {
  const tree = useTreeContext<T>();

  return nodes.map((node) => {
    const hasChildren = tree.showEmptyChild || !!node.children.length;
    const expanded = (() => {
      if (!hasChildren) return false;
      if (!tree.collapsible) return true;
      return tree.expanded.has(node.id);
    })();

    return (
      <div key={node.id}>
        <Tree.Item
          id={node.id}
          level={level}
          hasChildren={hasChildren}
          expanded={expanded}
          {...(renderItem && {
            asChild: true,
            children: renderItem({ node, tree, level, expanded }),
          })}
        />
        {!expanded ? null : node.children.length > 0 ? (
          <Tree.Group>
            <TreeList
              nodes={node.children}
              level={level + 1}
              renderItem={renderItem}
            />
          </Tree.Group>
        ) : (
          <Tree.EmptyIndicator
            style={{ paddingLeft: (level + 1) * tree.indent }}
            {...(renderEmpty && { asChild: true, children: renderEmpty() })}
          />
        )}
      </div>
    );
  });
};

export { Tree, useTree, useTreeContext };
export type {
  TreeOptions,
  TreeProps,
  TreeItemProps,
  DivSlotProps as TreeGroupProps,
};
