import { title as createTitle } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import { TitleCell } from "./title-cell";
import { TitleConfig } from "./title-config";

export function title() {
  return createTitle({
    icon: <DefaultIcon type="title" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="title" />,
    renderCellValue: () => null,
    renderCellEditor: (props) =>
      props.scope.kind === "cell"
        ? {
            presentation: "inline",
            content: <TitleCell {...props} row={props.scope.row} />,
          }
        : { presentation: "inline", content: null },
    renderConfigMenu: (props) => <TitleConfig {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}
