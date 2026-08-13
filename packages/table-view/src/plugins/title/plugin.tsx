import { title as createTitle } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { TitleCell } from "./title-cell";
import { TitleConfig } from "./title-config";

export function title() {
  return createTitle({
    icon: <DefaultIcon type="title" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="title" />,
    renderCell: (props) => <TitleCell {...props} />,
    renderConfigMenu: (props) => <TitleConfig {...props} />,
  });
}
