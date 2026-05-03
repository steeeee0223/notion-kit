"use client";

import * as React from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import type {
  DragTarget,
  ItemInstance,
  TreeConfig,
  TreeInstance,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { Slot } from "radix-ui";

import { cn } from "@notion-kit/cn";

import * as Icon from "./icons";

interface TreeItemBase {
  name: string;
  children?: string[];
}

interface TreeContextValue<T = unknown> {
  indent: number;
  currentItem?: ItemInstance<T>;
  tree?: TreeInstance<T>;
}

const TreeContext = React.createContext<TreeContextValue<unknown>>({
  indent: 20,
  currentItem: undefined,
  tree: undefined,
});

function useTreeContext<T>() {
  return React.use(TreeContext) as TreeContextValue<T>;
}

type PickedTreeConfig<T> = Pick<
  TreeConfig<T>,
  "indent" | "initialState" | "rootItemId" | "state"
>;
type DropItemsHandler<T> = (
  src: ItemInstance<T>[],
  target: DragTarget<T>,
) => void;

interface TreeProps<T extends TreeItemBase>
  extends React.HTMLAttributes<HTMLDivElement>,
    PickedTreeConfig<T> {
  items: Record<string, T>;
  getItemName?: (item: ItemInstance<T>) => string;
  isItemFolder?: (item: ItemInstance<T>) => boolean;
  renderItem?: (item: ItemInstance<T>) => React.ReactNode;
  onItemsDrop?: DropItemsHandler<T>;
}

function Tree<T extends TreeItemBase>({
  className,
  indent = 20,
  initialState,
  rootItemId,
  state,
  children,
  items,
  getItemName,
  isItemFolder,
  renderItem,
  onItemsDrop,
  ...props
}: TreeProps<T>) {
  const tree = useTree<T>({
    initialState,
    state,
    indent,
    rootItemId,
    getItemName: getItemName ?? ((item) => item.getItemData().name),
    isItemFolder:
      isItemFolder ??
      ((item) => (item.getItemData().children?.length ?? 0) > 0),
    canReorder: true,
    onDrop: (items, target) => onItemsDrop?.(items, target),
    dataLoader: {
      getItem: (itemId) => items[itemId]!,
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = {
    ...tree.getContainerProps(),
    ...props,
  };

  // Merge styles
  const mergedStyle = {
    ...propStyle,
    "--tree-indent": `${indent}px`,
  } as React.CSSProperties;

  const ctx = React.useMemo<TreeContextValue>(
    () => ({ indent, tree: tree as TreeInstance<unknown> }),
    [indent, tree],
  );

  return (
    <TreeContext value={ctx}>
      <div
        data-slot="tree"
        style={mergedStyle}
        className={cn("flex flex-col", className)}
        {...otherProps}
      >
        <AssistiveTreeDescription tree={tree} />
        {tree.getItems().map((item) => renderItem?.(item))}
        <TreeDragLine />
        {children}
      </div>
    </TreeContext>
  );
}

interface TreeItemProps<T> extends React.ComponentProps<"div"> {
  item: ItemInstance<T>;
  indent?: number;
  asChild?: boolean;
}

function TreeItem<T>({
  item,
  className,
  asChild,
  children,
  ...props
}: Omit<TreeItemProps<T>, "indent">) {
  const { indent, tree } = useTreeContext<T>();

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = {
    ...item.getProps(),
    onClick: (e) => {
      e.preventDefault();
      tree?.setSelectedItems([item.getItemMeta().itemId]);
      item.setFocused();
    },
    ...props,
  } satisfies React.ComponentProps<"div">;

  // Merge styles
  const mergedStyle = {
    ...propStyle,
    "--tree-padding": `${item.getItemMeta().level * indent}px`,
  } as React.CSSProperties;

  const Comp = asChild ? Slot.Root : "div";

  const ctx = React.useMemo<TreeContextValue>(
    () => ({ indent, currentItem: item as ItemInstance<unknown> }),
    [indent, item],
  );

  return (
    <TreeContext value={ctx}>
      <Comp
        role="treeitem"
        data-slot="tree-item"
        style={mergedStyle}
        className={cn(
          "z-10 ps-(--tree-padding) outline-hidden select-none focus:z-20",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
          className,
        )}
        data-focus={item.isFocused() || false}
        data-folder={item.isFolder() || false}
        data-selected={item.isSelected() || false}
        data-drag-target={item.isDragTarget() || false}
        /**
         * @note must use this pattern to avoid error
         */
        data-search-match={
          typeof item.isMatchingSearch === "function"
            ? item.isMatchingSearch() || false
            : undefined
        }
        aria-expanded={item.isExpanded()}
        {...otherProps}
      >
        {children}
      </Comp>
    </TreeContext>
  );
}

interface TreeItemLabelProps<T> extends React.HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>;
}

function TreeItemLabel<T>({
  item: propItem,
  children,
  className,
  ...props
}: TreeItemLabelProps<T>) {
  const { currentItem } = useTreeContext<T>();
  const item = propItem ?? currentItem;

  if (!item) {
    console.warn("TreeItemLabel: No item provided via props or context");
    return null;
  }

  return (
    <span
      data-slot="tree-item-label"
      className={cn(
        "flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1.5 text-sm text-sidebar-primary transition-colors hover:bg-default/5",
        "not-in-data-[folder=true]:ps-7 in-focus-visible:shadow-notion in-data-[drag-target=true]:bg-default/10",
        "in-data-[selected=true]:bg-default/10 in-data-[selected=true]:text-primary",
        "in-data-[search-match=true]:bg-blue/20!",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {item.isFolder() && (
        <Icon.ChevronDown className="in-aria-[expanded=false]:-rotate-90" />
      )}
      {children ?? item.getItemName()}
    </span>
  );
}

function TreeDragLine({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { tree } = useTreeContext();

  if (!tree) {
    console.warn("TreeDragLine: No tree provided via context");
    return null;
  }

  const dragLine = tree.getDragLineStyle();
  return (
    <div
      style={dragLine}
      className={cn("absolute z-30 mx-3 -mt-px h-1 bg-blue/40", className)}
      {...props}
    />
  );
}

export { Tree, TreeItem, TreeItemLabel, TreeDragLine, createOnDropHandler };
export type { TreeItemBase, ItemInstance, TreeInstance, DropItemsHandler };
