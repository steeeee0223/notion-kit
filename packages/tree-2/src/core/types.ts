export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

export interface TreeIndexes {
  visibleIds: string[];
  parentMap: Map<string, string | null>;
  childrenMap: Map<string, string[]>;
}

export interface TreeInstance {
  indexes: TreeIndexes;
  expanded: Set<string>;
  selected: Set<string>;
  collapsible: boolean;
  expand: (id: string) => void;
  select: (id: string) => void;
  registerItem: (id: string, el: HTMLElement | null) => void;
  focusItem: (id: string) => void;
}
