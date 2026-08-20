import { number as createNumber } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { NumberCellEditor, NumberCellValue } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu";
import { NumberGroupingValue } from "./number-grouping-value";

export function number() {
  return createNumber({
    icon: <DefaultIcon type="number" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="number" />,
    renderCellValue: (props) => <NumberCellValue {...props} />,
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
  });
}
