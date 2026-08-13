import {
  createdTime as createCreatedTime,
  date as createDate,
  lastEditedTime as createLastEditedTime,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DateCell, DatePickerCell } from "./date-cell";
import { DateConfigMenu } from "./date-config-menu";
import { DateGroupingValue } from "./date-grouping-value";

const dateRenderers = {
  renderConfigMenu: DateConfigMenu,
  renderGroupingValue: DateGroupingValue,
};

export function date() {
  return createDate({
    icon: <DefaultIcon type="date" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="date" />,
    renderCell: (props) => <DatePickerCell {...props} />,
    ...dateRenderers,
  });
}

export function createdTime() {
  return createCreatedTime({
    icon: <DefaultIcon type="created-time" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="created-time" />,
    renderCell: (props) => <DateCell {...props} />,
    ...dateRenderers,
  });
}

export function lastEditedTime() {
  return createLastEditedTime({
    icon: <DefaultIcon type="last-edited-time" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="last-edited-time" />,
    renderCell: (props) => <DateCell {...props} />,
    ...dateRenderers,
  });
}
