import type { TitlePlugin } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import type { TableUiPlugin } from "../registry";
import { TitleCellValue } from "./title-cell";
import { TitleConfig } from "./title-config";

export function title(): TableUiPlugin<TitlePlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<TitlePlugin>["renderCell"]>[0]) => (
    <TitleCellValue {...props} />
  );
  return {
    id: "title",
    meta: { name: "Title", desc: "", icon: <DefaultIcon type="title" className="fill-menu-icon" /> },
    default: { name: "Title", icon: <DefaultIcon type="title" /> },
    renderCell,
    renderCellValue: renderCell,
    renderConfigMenu: (props) => <TitleConfig {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}
