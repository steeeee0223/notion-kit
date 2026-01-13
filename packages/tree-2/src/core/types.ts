export interface TreeItemData {
  id: string;
  parentId?: string | null;
  title: string;
}

export type TreeNode<T extends TreeItemData> = T & {
  level: number;
  children: string[];
};

export interface TreeEntity<T extends TreeItemData> {
  rootIds: string[];
  flatIds: string[];
  nodes: Map<string, TreeNode<T>>;
}

export interface TreeState {
  expanded: Set<string>;
  selected: Set<string>;
}

export interface TreeInstance<T extends TreeItemData> {
  // config
  indent: number;
  showEmptyChild: boolean;
  collapsible: boolean;
  // state
  original: T[];
  entity: TreeEntity<T>;
  state: TreeState;
  expand: (id: string) => void;
  select: (id: string) => void;
  registerItem: (id: string, el: HTMLElement | null) => void;
  focusItem: (id: string) => void;
  getVisibleIds: () => string[];
}
