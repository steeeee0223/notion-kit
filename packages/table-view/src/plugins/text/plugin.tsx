import { DefaultIcon } from "../../common";
import { compareStrings, createCompareFn } from "../utils";
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
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    compare: createCompareFn(compareStrings),
    renderCell: (props) => <TextCell {...props} />,
  };
}
