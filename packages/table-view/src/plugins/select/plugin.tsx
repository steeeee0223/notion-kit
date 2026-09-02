import {
  type MultiSelectPlugin,
  type SelectPlugin,
} from "@notion-kit/table-hook/plugins";
import { functionalUpdate } from "@tanstack/react-table";

import { DefaultIcon } from "@/common";

import { SelectCellEditor, SelectCellValue } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { SelectGroupingValue } from "./select-grouping-value";
import type { TableUiPlugin } from "../registry";

export function select(): TableUiPlugin<SelectPlugin> {
  const renderCell = ({ data, ...props }: Parameters<TableUiPlugin<SelectPlugin>["renderCell"]>[0]) => (
    <SelectCellValue data={data ? [data] : []} {...props} />
  );
  return {
    id: "select",
    meta: { name: "Select", desc: "Use a select property to choose one option from a predefined list. Great for categorization.", icon: <DefaultIcon type="select" className="fill-menu-icon" /> },
    default: { name: "Select", icon: <DefaultIcon type="select" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: ({ data, onChange, scope, ...props }) => ({
      presentation: "popover",
      content: <SelectCellEditor data={data ? [data] : []} onChange={(updater) => onChange((previous) => functionalUpdate(updater, previous ? [previous] : []).at(0) ?? null)} scope={scope.kind === "cell" ? scope : { ...scope, selectedValues: scope.selectedValues.map((value) => value ? [value] : []) }} {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className: "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      },
    }),
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  };
}

export function multiSelect(): TableUiPlugin<MultiSelectPlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<MultiSelectPlugin>["renderCell"]>[0]) => (
    <SelectCellValue multi {...props} />
  );
  return {
    id: "multi-select",
    meta: { name: "Multi-Select", desc: "Use a multi-select property to choose multiple options from a predefined list. Useful for tagging or categorization.", icon: <DefaultIcon type="multi-select" className="fill-menu-icon" /> },
    default: { name: "Multi-Select", icon: <DefaultIcon type="multi-select" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <SelectCellEditor multi {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className: "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      },
    }),
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  };
}
