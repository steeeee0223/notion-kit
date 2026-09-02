import { createContext, use, useMemo, type ReactNode } from "react";
import { functionalUpdate, type OnChangeFn } from "@tanstack/react-table";

import type {
  CellInstance,
  ColumnInfo,
  ColumnInstance,
  Row,
} from "@notion-kit/table-hook";
import type {
  CellPlugin,
  InferConfig,
  InferData,
} from "@notion-kit/table-hook/plugins";
import { IconBlock } from "@notion-kit/ui/icon-block";

import { useCellContext } from "@/common/cell";
import { useTableViewCtx } from "@/table-contexts";

import type { TableUiPlugin } from "./registry";

export interface CellRendererProps<Data, Config = undefined> {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  property: Pick<ColumnInfo, "description" | "icon" | "name">;
  surface: "table" | "list" | "board" | "row-view" | "timeline";
  textValue: string;
  wrapped?: boolean;
  disabled?: boolean;
  onChange: OnChangeFn<Data>;
  onConfigChange?: OnChangeFn<Config>;
}

export type CellValueProps<Data, Config = undefined> = Pick<
  CellRendererProps<Data, Config>,
  "config" | "data" | "disabled" | "propId" | "row" | "wrapped"
>;

export type CellEditorProps<Data, Config = undefined> = Pick<
  CellRendererProps<Data, Config>,
  "config" | "data" | "onChange" | "onConfigChange"
>;

export interface BulkEditorRendererProps<Data, Config = undefined> {
  propId: string;
  data: Data;
  config: Config;
  disabled?: boolean;
  onChange: OnChangeFn<Data>;
  onConfigChange?: OnChangeFn<Config>;
  rowIds: string[];
  selectedValues: Data[];
  label: string;
  icon: ReactNode;
}

export interface ConfigMenuRendererProps<Config = unknown> {
  propId: string;
  config: Config;
  onChange: OnChangeFn<Config>;
}

export function createCellRenderer<TPlugin extends CellPlugin>(
  renderer: (
    props: CellRendererProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => ReactNode,
): TableUiPlugin<TPlugin>["renderCell"] {
  return ({ cell }) => (
    <ResolvedCellRenderer<TPlugin> cell={cell} renderer={renderer} />
  );
}

function ResolvedCellRenderer<TPlugin extends CellPlugin>({
  cell,
  renderer,
}: {
  cell: CellInstance;
  renderer: (
    props: CellRendererProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => ReactNode;
}) {
  const { table, surface, wrapped } = useCellContext();
  const info = cell.getInfo() as ColumnInfo<TPlugin>;
  const data = cell.getData<TPlugin>();

  return renderer({
    propId: cell.column.id,
    row: cell.row.original,
    data,
    config: info.config,
    property: info,
    surface,
    textValue: cell.getTextValue(),
    wrapped,
    disabled: table.getTableGlobalState().locked,
    onChange: (updater) => cell.update<TPlugin>(updater),
    onConfigChange: (updater) => cell.column.updateConfig<TPlugin>(updater),
  });
}

const BulkEditorContext = createContext<{ disabled?: boolean } | null>(null);

export function BulkEditorScope({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const value = useMemo(() => ({ disabled }), [disabled]);
  return <BulkEditorContext value={value}>{children}</BulkEditorContext>;
}

export function createBulkEditorRenderer<TPlugin extends CellPlugin>(
  renderer: (
    props: BulkEditorRendererProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => ReactNode,
): NonNullable<TableUiPlugin<TPlugin>["renderBulkEditor"]> {
  return ({ column }) => (
    <ResolvedBulkEditorRenderer<TPlugin> column={column} renderer={renderer} />
  );
}

function ResolvedBulkEditorRenderer<TPlugin extends CellPlugin>({
  column,
  renderer,
}: {
  column: ColumnInstance;
  renderer: (
    props: BulkEditorRendererProps<InferData<TPlugin>, InferConfig<TPlugin>>,
  ) => ReactNode;
}) {
  const scope = use(BulkEditorContext);
  const { plugins } = useTableViewCtx();
  const info = column.getInfo() as ColumnInfo<TPlugin>;
  const plugin = column.getPlugin() as TPlugin;
  const uiPlugin = plugins.getUiPlugin(plugin.id);
  const rowIds = column.getSelectedRowIds();
  const selectedValues: InferData<TPlugin>[] = [];
  for (const rowId of rowIds) {
    const value = column.getCell<TPlugin>(rowId).value;
    selectedValues.push(value as unknown as InferData<TPlugin>);
  }

  return renderer({
    propId: column.id,
    data: plugin.default.data as InferData<TPlugin>,
    config: info.config,
    disabled: scope?.disabled,
    rowIds,
    selectedValues,
    label: info.name,
    icon: info.icon ? (
      <IconBlock icon={info.icon} className="size-4 p-0" />
    ) : (
      uiPlugin.default.icon
    ),
    onChange: (updater) =>
      column.updateCells(
        rowIds,
        functionalUpdate(updater, plugin.default.data),
      ),
    onConfigChange: (updater) => column.updateConfig<TPlugin>(updater),
  });
}

export function createConfigMenuRenderer<TPlugin extends CellPlugin>(
  renderer: (props: ConfigMenuRendererProps<InferConfig<TPlugin>>) => ReactNode,
): NonNullable<TableUiPlugin<TPlugin>["renderConfigMenu"]> {
  return ({ column }) => (
    <ResolvedConfigMenuRenderer<TPlugin> column={column} renderer={renderer} />
  );
}

function ResolvedConfigMenuRenderer<TPlugin extends CellPlugin>({
  column,
  renderer,
}: {
  column: ColumnInstance;
  renderer: (props: ConfigMenuRendererProps<InferConfig<TPlugin>>) => ReactNode;
}) {
  const info = column.getInfo() as ColumnInfo<TPlugin>;
  return renderer({
    propId: column.id,
    config: info.config,
    onChange: (updater) => column.updateConfig(updater),
  });
}
