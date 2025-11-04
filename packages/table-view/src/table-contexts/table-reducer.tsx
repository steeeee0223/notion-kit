import type { Updater } from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";

import type { ColumnsInfoState } from "../features";
import type { PluginsMap, Rows } from "../lib/types";
import type { CellPlugin } from "../plugins";
import type { SyncedState } from "./types";

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
  /**
   * @field synced state for re-rendering
   */
  synced: SyncedState;
}

export type TableViewAction<TPlugins extends CellPlugin[]> =
  | { type: "set:col"; updater: Updater<ColumnsInfoState> }
  | { type: "set:col:order" | "set:row:order"; updater: Updater<string[]> }
  | { type: "set:table:data"; updater: Updater<Rows<TPlugins>> }
  | { type: "sync"; payload: (keyof SyncedState)[] }
  | { type: "reset" };

function tableViewReducer<TPlugins extends CellPlugin[]>(
  p: PluginsMap<TPlugins>,
  v: TableViewAtom<TPlugins>,
  a: TableViewAction<TPlugins>,
): TableViewAtom<TPlugins> {
  switch (a.type) {
    case "set:col": {
      return {
        ...v,
        properties: functionalUpdate(a.updater, v.properties),
        synced: { ...v.synced, header: Date.now() },
      };
    }
    case "set:table:data": {
      return {
        ...v,
        data: functionalUpdate(a.updater, v.data),
        synced: { ...v.synced, body: Date.now() },
      };
    }
    case "set:col:order": {
      return {
        ...v,
        propertiesOrder: functionalUpdate(a.updater, v.propertiesOrder),
        synced: { ...v.synced, header: Date.now() },
      };
    }
    case "set:row:order": {
      return {
        ...v,
        dataOrder: functionalUpdate(a.updater, v.dataOrder),
        synced: { ...v.synced, body: Date.now() },
      };
    }
    case "sync": {
      const synced = { ...v.synced };
      a.payload.forEach((key) => {
        synced[key] = Date.now();
      });
      return { ...v, synced };
    }
    case "reset":
      return {
        properties: {},
        propertiesOrder: [],
        dataOrder: [],
        data: {},
        synced: { header: -1, body: -1, footer: -1 },
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
