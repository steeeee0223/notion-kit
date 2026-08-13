import { number as createNumber } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { NumberCell } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu";
import { NumberGroupingValue } from "./number-grouping-value";

export function number() {
  return createNumber({
    icon: <DefaultIcon type="number" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="number" />,
    renderCell: (props) => <NumberCell {...props} />,
    renderConfigMenu: (props) => <NumberConfigMenu {...props} />,
    renderGroupingValue: (props) => <NumberGroupingValue {...props} />,
  });
}
