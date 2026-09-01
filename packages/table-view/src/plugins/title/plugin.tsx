import { title as createTitle } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import { TitleCellValue } from "./title-cell";
import { TitleConfig } from "./title-config";

export function title() {
  return createTitle({
    icon: <DefaultIcon type="title" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="title" />,
    renderCellValue: (props) => <TitleCellValue {...props} />,
    renderConfigMenu: (props) => <TitleConfig {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}
