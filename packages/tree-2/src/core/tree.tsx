"use client";

import React, {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@notion-kit/cn";

import type {
  TreeInstance,
  TreeItemData,
  TreeNode,
  TreeNodeInternal,
} from "./types";
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

  const entity = useMemo(() => {
    // When not collapsible, treat all nodes as expanded
    if (!collapsible) {
      const allExpanded = new Set<string>();
      const collectIds = (nodes: TreeNode<T>[]) => {
        nodes.forEach((node) => {
          allExpanded.add(node.id);
          if (node.children.length > 0) {
            collectIds(node.children);
          }
        });
      };
      collectIds(data);
      return buildTree(data, allExpanded);
    }
    return buildTree(data, expanded);
  }, [data, expanded, collapsible]);

  const expand = useCallback(
    (id: string) => {
      if (!collapsible) return;

      // Check if node has children
      const node = entity.nodes.get(id);
      const hasChildren = showEmptyChild || (node?.children.length ?? 0) > 0;
      if (!hasChildren) return;

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
    [collapsible, onExpandedChange, entity, showEmptyChild],
  );

  const state = useMemo(() => {
    const visible = new Set(entity.flatIds);
    const levels = new Map<string, number>();
    entity.nodes.forEach((node, id) => {
      if ("level" in node) {
        levels.set(id, node.level);
      }
    });
    return { expanded, selected, visible, levels };
  }, [expanded, selected, entity]);

  return {
    indent,
    showEmptyChild,
    original: data,
    entity,
    state,
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

interface DivSlotProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface TreeProps<T extends TreeItemData> extends DivSlotProps {
  tree: TreeInstance<T>;
}

function Tree<T extends TreeItemData>({ tree, ...props }: TreeProps<T>) {
  return (
    <TreeContext value={tree}>
      <div role="tree" {...props} />
    </TreeContext>
  );
}

interface TreeItemProps extends DivSlotProps {
  id: string;
}

const composeRefs =
  <T,>(...refs: (React.Ref<T> | undefined)[]) =>
  (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        ref.current = node;
      }
    });
  };

Tree.Item = function TreeItem({
  asChild,
  ref,
  id,
  children,
  ...props
}: TreeItemProps) {
  const Comp = asChild ? Slot : "div";
  const tree = useTreeContext();
  const node = tree.entity.nodes.get(id);

  if (!node) return;

  const nav = createTreeNavigation(id, tree);
  const composedRef = composeRefs((el) => tree.registerItem(id, el), ref);

  return (
    <Comp
      role="treeitem"
      ref={composedRef}
      id={id}
      aria-level={node.level}
      aria-expanded={tree.state.expanded.has(id)}
      aria-selected={tree.state.selected.has(id)}
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

Tree.Group = function TreeGroup({ asChild, ...props }: DivSlotProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp role="group" {...props} />;
};

Tree.EmptyIndicator = function TreeEmptyIndicator({
  asChild,
  className,
  children,
  ...props
}: DivSlotProps) {
  return asChild ? (
    <Slot {...props} className={className}>
      {children}
    </Slot>
  ) : (
    <div {...props} className={cn("text-muted", className)}>
      No items
    </div>
  );
};

interface TreeListItemProps<T extends TreeItemData> {
  node: TreeNodeInternal<T>;
  tree: TreeInstance<T>;
  state: { expanded?: boolean; selected?: boolean };
}

interface TreeListProps<T extends TreeItemData> {
  nodes: TreeNode<T>[];
  renderItem?: (props: TreeListItemProps<T>) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

Tree.List = function TreeList<T extends TreeItemData>({
  nodes,
  renderItem,
  renderEmpty,
}: TreeListProps<T>) {
  const tree = useTreeContext<T>();

  return nodes.map((node) => {
    const expanded = tree.state.expanded.has(node.id);
    const selected = tree.state.selected.has(node.id);
    const data = tree.entity.nodes.get(node.id)!;

    // Determine if we should show children area
    const hasChildren = tree.showEmptyChild || node.children.length > 0;
    const shouldShowChildren = hasChildren && (!tree.collapsible || expanded);

    return (
      <div key={node.id}>
        <Tree.Item
          id={node.id}
          style={{ paddingLeft: data.level * tree.indent }}
          {...(renderItem && {
            asChild: true,
            children: renderItem({
              node: data,
              tree,
              state: { expanded, selected },
            }),
          })}
        />
        {!shouldShowChildren ? null : node.children.length > 0 ? (
          <Tree.Group>
            <Tree.List
              nodes={node.children}
              renderItem={renderItem}
              renderEmpty={renderEmpty}
            />
          </Tree.Group>
        ) : (
          <Tree.EmptyIndicator
            style={{ paddingLeft: (data.level + 1) * tree.indent }}
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
  TreeListProps,
  TreeListItemProps,
  DivSlotProps as TreeGroupProps,
};
