import { DefaultIcon } from "../../common";
import { TextCell } from "./text-cell";
import type { TextPlugin } from "./types";

export function text(): TextPlugin {
  return {
    id: "text",
    default: {
      name: "Text",
      icon: <DefaultIcon type="text" />,
      data: "",
    },
    fromReadableValue: (value) => value,
    toReadableValue: (data) => data,
    toTextValue: (data) => data,
    renderCell: ({ data, wrapped, onChange }) => (
      <TextCell value={data} wrapped={wrapped} onUpdate={onChange} />
    ),
    reducer: (v) => v,
  };
}
