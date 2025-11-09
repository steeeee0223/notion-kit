import { DefaultIcon } from "../../common";
import { DateCell } from "./date-cell";
import { DateConfigMenu } from "./date-config-menu";
import type { DatePlugin } from "./types";
import { toDateString } from "./utils";

export function date(): DatePlugin {
  return {
    id: "date",
    meta: {
      name: "Date",
      // TODO
      icon: <DefaultIcon type="date" className="fill-menu-icon" />,
      desc: "Accepts a date or a date range (time optional). Useful for deadlines, especially with calendar and timeline views.",
    },
    default: {
      name: "Date",
      icon: <DefaultIcon type="date" />,
      data: {},
      config: {
        dateFormat: "full",
        timeFormat: "12-hour",
        // TODO
        tz: "GMT",
      },
    },
    fromReadableValue: () => ({}),
    toReadableValue: (data) => {
      if (data.start === undefined) return "";
      return data.start.toString();
    },
    toTextValue: (data) =>
      toDateString(data, {
        dateFormat: "full",
        timeFormat: "12-hour",
        tz: "GMT",
      }),
    renderCell: (props) => <DateCell {...props} />,
    renderConfigMenu: (props) => <DateConfigMenu {...props} />,
    reducer: (v) => v,
  };
}
