import { DefaultIcon } from "../../common";
import { TextCell } from "./text-cell";
import type { TextPlugin } from "./types";

export function text(): TextPlugin {
  return {
    id: "text",
    meta: {
      name: "Text",
      icon: <DefaultIcon type="text" className="fill-menu-icon" />,
      desc: "Add text that can be formatted. Great for summaries, notes, or descriptions.",
    },
    default: {
      name: "Text",
      icon: <DefaultIcon type="text" />,
      data: "",
      config: undefined,
    },
    fromReadableValue: (value) => value,
    toReadableValue: (data) => data,
    toTextValue: (data) => data,
    renderCell: (props) => <TextCell {...props} />,
    reducer: (v) => v,
  };
}
