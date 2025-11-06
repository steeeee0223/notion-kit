import { DefaultIcon } from "../../common";
import { NEVER } from "../../lib/utils";
import { CheckboxCell } from "./checkbox-cell";
import type { CheckboxPlugin } from "./types";

export function checkbox(): CheckboxPlugin {
  return {
    id: "checkbox",
    meta: {
      name: "Checkbox",
      icon: <DefaultIcon type="checkbox" className="fill-menu-icon" />,
      desc: "Use a checkbox to indicate whether a condition is true or false. Useful for lightweight task tracking.",
    },
    default: {
      name: "Checkbox",
      icon: <DefaultIcon type="checkbox" />,
      data: false,
      config: NEVER,
    },
    fromReadableValue: () => false,
    toReadableValue: (data) => (data ? "v" : ""),
    toTextValue: (data) => (data ? "✅" : ""),
    renderCell: ({ data, wrapped, onChange }) => (
      <CheckboxCell checked={data} wrapped={wrapped} onChange={onChange} />
    ),
    reducer: (v) => v,
  };
}
