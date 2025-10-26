import type { SortingState, Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { v4 } from "uuid";

import type { IconData } from "@notion-kit/icon-block";

import { ColumnsInfoState } from "../features";
import type { Cell, PluginsMap, Row, Rows } from "../lib/types";
import { getDefaultCell, insertAt } from "../lib/utils";
import type { CellPlugin } from "../plugins";

export interface TableViewAtom<TPlugins extends CellPlugin[] = CellPlugin[]> {
  /**
   * @field property definitions
   * @param key property (column) id
   */
  properties: ColumnsInfoState<TPlugins>;
  /**
   * @field array of ordered property (column) ids
   * @note freezed columns: `propertiesOrder.slice(0, freezedIndex + 1)`
   */
  propertiesOrder: string[];
  /**
   * @field array of ordered data (row) ids
   */
  dataOrder: string[];
  /**
   * @field data of each row
   * @param key property (column) id
   */
  data: Rows<TPlugins>;
}

export type TableViewAction<TPlugins extends CellPlugin[]> =
  | { type: "set:col"; updater: Updater<ColumnsInfoState> }
  | { type: "set:col:order" | "set:row:order"; updater: Updater<string[]> }
  | {
      type: "delete:row" | "duplicate:row";
      payload: { id: string };
    }
  | { type: "add:row"; payload?: { id: string; at: "prev" | "next" } }
  | { type: "update:row:icon"; payload: { id: string; icon: IconData | null } }
  | {
      type: "update:cell";
      payload: {
        rowId: string;
        colId: string;
        data: Cell<CellPlugin>;
      };
    }
  | { type: "set:table:data"; payload: Rows<TPlugins> }
  | { type: "update:sorting"; updater: Updater<SortingState> }
  | { type: "reset" };

function tableViewReducer<TPlugins extends CellPlugin[]>(
  p: PluginsMap<TPlugins>,
  v: TableViewAtom<TPlugins>,
  a: TableViewAction<TPlugins>,
): TableViewAtom<TPlugins> {
  switch (a.type) {
    case "set:col": {
      return { ...v, properties: functionalUpdate(a.updater, v.properties) };
    }
    case "add:row": {
      const row: Row<TPlugins> = { id: v4(), properties: {} };
      v.propertiesOrder.forEach((colId) => {
        const type = v.properties[colId]!.type;
        row.properties[colId] = getDefaultCell(p[type]);
      });
      return {
        ...v,
        get dataOrder() {
          if (a.payload === undefined) return [...v.dataOrder, row.id];
          const idx = v.dataOrder.indexOf(a.payload.id);
          return a.payload.at === "next"
            ? insertAt(v.dataOrder, row.id, idx + 1)
            : insertAt(v.dataOrder, row.id, idx);
        },
        data: { ...v.data, [row.id]: row },
      };
    }
    case "duplicate:row": {
      const row = { ...v.data[a.payload.id]!, id: v4() };
      v.propertiesOrder.forEach((colId) => (row.properties[colId]!.id = v4()));
      return {
        ...v,
        data: { ...v.data, [row.id]: row },
        get dataOrder() {
          const idx = v.dataOrder.indexOf(a.payload.id);
          return insertAt(v.dataOrder, row.id, idx + 1);
        },
      };
    }
    case "update:row:icon": {
      const row = v.data[a.payload.id];
      if (!row) return v as never;
      row.icon = a.payload.icon ?? undefined;
      const colId = v.propertiesOrder.find(
        (propId) => v.properties[propId]?.type === "title",
      )!;
      row.properties[colId]!.value.icon = a.payload.icon ?? undefined;
      return { ...v, data: { ...v.data, [a.payload.id]: row } };
    }
    case "delete:row": {
      const { [a.payload.id]: _, ...data } = v.data;
      return {
        ...v,
        dataOrder: v.dataOrder.filter((rowId) => rowId !== a.payload.id),
        data,
      };
    }
    case "set:table:data": {
      return { ...v, data: a.payload };
    }
    case "update:cell": {
      const data = { ...v.data };
      data[a.payload.rowId]!.properties[a.payload.colId] = a.payload.data;
      return { ...v, data };
    }
    case "set:col:order": {
      return {
        ...v,
        propertiesOrder: functionalUpdate(a.updater, v.propertiesOrder),
      };
    }
    case "set:row:order": {
      return { ...v, dataOrder: functionalUpdate(a.updater, v.dataOrder) };
    }
    case "reset":
      return {
        properties: {},
        propertiesOrder: [],
        dataOrder: [],
        data: {},
      };
    default:
      return v;
  }
}

export function createTableViewReducer<TPlugins extends CellPlugin[]>(
  plugins: PluginsMap<TPlugins>,
) {
  return (v: TableViewAtom<TPlugins>, a: TableViewAction<TPlugins>) =>
    tableViewReducer<TPlugins>(plugins, v, a);
}
