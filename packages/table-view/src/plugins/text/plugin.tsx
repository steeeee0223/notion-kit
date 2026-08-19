import { text as createText } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import { TextCellEditor, TextCellValue } from "./text-cell";

export function text() {
  return createText({
    icon: <DefaultIcon type="text" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="text" />,
    renderCellValue: (props) => <TextCellValue {...props} />,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <TextCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (triggerRect) => -triggerRect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}
