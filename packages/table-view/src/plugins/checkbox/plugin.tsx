import type { CheckboxPlugin } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { CheckboxCellEditor, CheckboxCellValue } from "./checkbox-cell";
import { CheckboxGroupingValue } from "./checkbox-grouping-value";
import type { TableUiPlugin } from "../registry";

export function checkbox(): TableUiPlugin<CheckboxPlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<CheckboxPlugin>["renderCell"]>[0]) => (
    <CheckboxCellValue {...props} />
  );
  return {
    id: "checkbox",
    meta: { name: "Checkbox", desc: "Use a checkbox to indicate whether a condition is true or false. Useful for lightweight task tracking.", icon: <DefaultIcon type="checkbox" className="fill-menu-icon" /> },
    default: { name: "Checkbox", icon: <DefaultIcon type="checkbox" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "inline",
      content: <CheckboxCellEditor {...props} />,
    }),
    renderGroupingValue: (props) => <CheckboxGroupingValue {...props} />,
  };
}
