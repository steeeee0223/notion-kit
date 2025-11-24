import { DefaultIcon } from "../../common";
import { TitleCell } from "./title-cell";
import { TitleConfig } from "./title-config";
import type { TitlePlugin } from "./types";

export function title(): TitlePlugin {
  return {
    id: "title",
    meta: {
      name: "Title",
      icon: <DefaultIcon type="title" className="fill-menu-icon" />,
      desc: "",
    },
    default: {
      name: "Title",
      icon: <DefaultIcon type="title" />,
      data: "",
      config: { showIcon: true },
    },
    fromReadableValue: (value) => value,
    toReadableValue: (data) => data,
    toTextValue: (data) => data,
    renderCell: ({ row, data, config, ...props }) => (
      <TitleCell
        value={data}
        icon={config.showIcon ? row.icon : undefined}
        {...props}
      />
    ),
    renderConfigMenu: (props) => <TitleConfig {...props} />,
    reducer: (v) => v,
  };
}
