import {
  multiSelect as createMultiSelect,
  select as createSelect,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { SelectCell } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { SelectGroupingValue } from "./select-grouping-value";

export function select() {
  return createSelect({
    icon: <DefaultIcon type="select" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="select" />,
    renderCell: (props) => <SelectCell {...props} />,
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  });
}

export function multiSelect() {
  return createMultiSelect({
    icon: <DefaultIcon type="multi-select" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="multi-select" />,
    renderCell: (props) => <SelectCell {...props} />,
    renderConfigMenu: (props) => <SelectConfigMenu {...props} />,
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  });
}
