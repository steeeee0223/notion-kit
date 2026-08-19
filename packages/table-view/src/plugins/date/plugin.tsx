import {
  createdTime as createCreatedTime,
  date as createDate,
  lastEditedTime as createLastEditedTime,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import {
  DateCell,
  DatePickerCellEditor,
  DatePickerCellValue,
} from "./date-cell";
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
    renderCellValue: (props) => <DatePickerCellValue {...props} />,
    renderCellEditor: (props) => ({
      presentation: "popover",
      closeOnChange: false,
      content: <DatePickerCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: 0,
        className: "w-62",
      },
    }),
    ...dateRenderers,
  });
}

export function createdTime() {
  return createCreatedTime({
    icon: <DefaultIcon type="created-time" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="created-time" />,
    renderCellValue: (props) => <DateCell {...props} />,
    ...dateRenderers,
  });
}

export function lastEditedTime() {
  return createLastEditedTime({
    icon: <DefaultIcon type="last-edited-time" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="last-edited-time" />,
    renderCellValue: (props) => <DateCell {...props} />,
    ...dateRenderers,
  });
}
