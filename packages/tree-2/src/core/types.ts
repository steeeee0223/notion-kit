export interface TreeItemData {
  id: string;
  title: string;
}

export type TreeNode<T extends TreeItemData> = T & {
  children: TreeNode<T>[];
};

export interface TreeEntity<T extends TreeItemData> {
  visibleIds: string[];
  nodes: Map<string, T>;
  parentMap: Map<string, string | null>;
  childrenMap: Map<string, string[]>;
}

export interface TreeInstance<T extends TreeItemData> {
  // config
  indent: number;
  showEmptyChild: boolean;
  collapsible: boolean;
  // state
  original: TreeNode<T>[];
  entity: TreeEntity<T>;
  expanded: Set<string>;
  selected: Set<string>;
  expand: (id: string) => void;
  select: (id: string) => void;
  registerItem: (id: string, el: HTMLElement | null) => void;
  focusItem: (id: string) => void;
}
