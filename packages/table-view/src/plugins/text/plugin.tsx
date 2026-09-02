import type { TextPlugin } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import type { TableUiPlugin } from "../registry";
import { TextCellEditor, TextCellValue } from "./text-cell";

export function text(): TableUiPlugin<TextPlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<TextPlugin>["renderCell"]>[0]) => (
    <TextCellValue {...props} />
  );
  return {
    id: "text",
    meta: { name: "Text", desc: "Add text that can be formatted. Great for summaries, notes, or descriptions.", icon: <DefaultIcon type="text" className="fill-menu-icon" /> },
    default: { name: "Text", icon: <DefaultIcon type="text" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <TextCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}
