import { checkbox as createCheckbox } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { CheckboxCell } from "./checkbox-cell";
import { CheckboxGroupingValue } from "./checkbox-grouping-value";

export function checkbox() {
  return createCheckbox({
    icon: <DefaultIcon type="checkbox" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="checkbox" />,
    renderCell: (props) => <CheckboxCell {...props} />,
    renderGroupingValue: (props) => <CheckboxGroupingValue {...props} />,
  });
}
