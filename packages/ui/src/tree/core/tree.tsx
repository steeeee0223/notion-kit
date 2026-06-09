import React, {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@notion-kit/cn";

import type { TreeInstance, TreeItemData, TreeNode } from "./types";
import { buildTree, createTreeNavigation } from "./utils";

interface TreeOptions {
  selectionMode?: "single" | "multiple";
  collapsible?: boolean;
  indent?: number;
  showEmptyChild?: boolean;
  initialSelected?: string[];
  onSelectionChange?: (id: string, selectedIds: Set<string>) => void;
  onExpandedChange?: (ids: Set<string>) => void;
}

function useTree<T extends TreeItemData>(data: T[], options: TreeOptions = {}) {
  const {
    indent = 12,
    showEmptyChild = false,
    selectionMode = "single",
    collapsible = true,
    initialSelected,
    onSelectionChange,
    onExpandedChange,
  } = options;

  const [expanded, setExpanded] = useState<Set<string>>(() =>
    collapsible ? new Set() : new Set(data.map((item) => item.id)),
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

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

        onSelectionChange?.(id, next);
        return next;
      });
    },
    [selectionMode, onSelectionChange],
  );

  const entity = useMemo(() => buildTree(data), [data]);
  const state = useMemo(
    () => ({
      expanded,
      selected: initialSelected ? new Set(initialSelected) : selected,
    }),
    [expanded, initialSelected, selected],
  );

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

  const getVisibleIds = useCallback(() => {
    const visibleIds: string[] = [];
    const queue = [...entity.rootIds];

    while (queue.length > 0) {
      const id = queue.shift()!;
      visibleIds.push(id);

      // Add children to queue if this node is expanded
      if (state.expanded.has(id)) {
        const node = entity.nodes.get(id);
        if (node?.children) {
          queue.unshift(...node.children);
        }
      }
    }

    return visibleIds;
  }, [entity, state.expanded]);

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
    getVisibleIds,
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
  extends React.ComponentProps<"div"> {
  tree: TreeInstance<T>;
}

function Tree<T extends TreeItemData>({ tree, ...props }: TreeProps<T>) {
  return (
    <TreeContext value={tree}>
      <div role="tree" {...props} />
    </TreeContext>
  );
}

interface TreeItemProps extends useRender.ComponentProps<"div"> {
  id: string;
}

Tree.Item = function TreeItem({ id, render, ...props }: TreeItemProps) {
  const tree = useTreeContext();
  const node = tree.entity.nodes.get(id);
  const nav = node ? createTreeNavigation(id, tree) : undefined;
  const registerRef = useCallback(
    (el: HTMLDivElement | null) => tree.registerItem(id, el),
    [id, tree],
  );

  return useRender({
    defaultTagName: "div",
    render,
    ref: registerRef,
    enabled: !!node,
    props: mergeProps(
      {
        role: "treeitem",
        id,
        "aria-level": node?.level,
        "aria-expanded": tree.state.expanded.has(id),
        "aria-selected": tree.state.selected.has(id),
        tabIndex: -1,
        onClick: () => tree.select(id),
        onKeyDown: nav?.onKeyDown,
        children: tree.entity.nodes.get(id)?.title,
      },
      props,
    ),
  });
};

interface TreeExpandIndicatorProps extends useRender.ComponentProps<"span"> {
  onToggle?: () => void;
}

Tree.ExpandIndicator = function TreeExpandIndicator({
  onToggle,
  render,
  ...props
}: TreeExpandIndicatorProps) {
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps(
      {
        "aria-hidden": true,
        tabIndex: -1,
        onClick: (e: React.MouseEvent<HTMLSpanElement>) => {
          e.stopPropagation();
          onToggle?.();
        },
      },
      props,
    ),
  });
};

Tree.Group = function TreeGroup({
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps({ role: "group" }, props),
  });
};

Tree.EmptyIndicator = function TreeEmptyIndicator({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      { className: cn("text-muted", className), children: "No items" },
      props,
    ),
  });
};

interface TreeListItemProps<T extends TreeItemData> {
  node: TreeNode<T>;
  tree: TreeInstance<T>;
  state: { expanded?: boolean; selected?: boolean };
}

interface TreeListProps<T extends TreeItemData> {
  nodeIds: string[];
  renderItem?: (props: TreeListItemProps<T>) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

Tree.List = function TreeList<T extends TreeItemData>({
  nodeIds,
  renderItem,
  renderEmpty,
}: TreeListProps<T>) {
  const tree = useTreeContext<T>();

  return nodeIds.map((nodeId) => {
    const node = tree.entity.nodes.get(nodeId);
    if (!node) return null;

    const expanded = tree.state.expanded.has(nodeId);
    const selected = tree.state.selected.has(nodeId);

    // Determine if we should show children area
    const hasChildren = tree.showEmptyChild || node.children.length > 0;
    const shouldShowChildren = hasChildren && (!tree.collapsible || expanded);

    return (
      <div key={nodeId}>
        <Tree.Item
          id={nodeId}
          style={{ paddingLeft: node.level * tree.indent }}
          {...(renderItem && {
            render: renderItem({
              node,
              tree,
              state: { expanded, selected },
            }) as React.ReactElement,
          })}
        />
        {!shouldShowChildren ? null : node.children.length > 0 ? (
          <Tree.Group>
            <Tree.List
              nodeIds={node.children}
              renderItem={renderItem}
              renderEmpty={renderEmpty}
            />
          </Tree.Group>
        ) : (
          <Tree.EmptyIndicator
            style={{ paddingLeft: (node.level + 1) * tree.indent }}
            {...(renderEmpty && {
              render: renderEmpty() as React.ReactElement,
            })}
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
};
