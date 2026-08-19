import {
  multiSelect as createMultiSelect,
  select as createSelect,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { SelectCellEditor, SelectCellValue } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { SelectGroupingValue } from "./select-grouping-value";

export function select() {
  return createSelect({
    icon: <DefaultIcon type="select" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="select" />,
    renderCellValue: (props) => <SelectCellValue {...props} />,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <SelectCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (triggerRect) => -triggerRect.height,
        className:
          "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      },
    }),
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  });
}

export function multiSelect() {
  return createMultiSelect({
    icon: <DefaultIcon type="multi-select" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="multi-select" />,
    renderCellValue: (props) => <SelectCellValue {...props} />,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <SelectCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (triggerRect) => -triggerRect.height,
        className:
          "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      },
    }),
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  });
}
