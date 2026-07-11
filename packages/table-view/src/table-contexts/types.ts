import type { BaseTableProps } from "@notion-kit/table-hook";

import type { CellPlugin } from "@/plugins";

export interface TableProps<TPlugins extends CellPlugin[] = CellPlugin[]>
  extends BaseTableProps<TPlugins> {
  plugins?: TPlugins;
  children?: React.ReactNode;
}
