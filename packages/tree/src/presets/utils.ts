export interface TreeItemData {
  id: string;
  title: string;
  parentId?: string | null;
  group?: string | null;
  icon?: React.ReactNode;
}
