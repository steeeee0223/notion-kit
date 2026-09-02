import type { NumberPlugin } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { NumberCellEditor, NumberCellValue } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu";
import { NumberGroupingValue } from "./number-grouping-value";
import type { TableUiPlugin } from "../registry";

export function number(): TableUiPlugin<NumberPlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<NumberPlugin>["renderCell"]>[0]) => (
    <NumberCellValue {...props} />
  );
  return {
    id: "number",
    meta: { name: "Number", desc: "Accepts numbers. These can also be formatted as currency or progress bars. Useful for tracking counts, prices and completion.", icon: <DefaultIcon type="number" className="fill-menu-icon" /> },
    default: { name: "Number", icon: <DefaultIcon type="number" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <NumberCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderConfigMenu: (props) => <NumberConfigMenu {...props} />,
    renderGroupingValue: (props) => <NumberGroupingValue {...props} />,
  };
}
