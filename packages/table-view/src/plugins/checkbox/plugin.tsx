import { DefaultIcon } from "../../common";
import { NEVER } from "../../lib/utils";
import { CheckboxCell } from "./checkbox-cell";
import type { CheckboxPlugin } from "./types";

export function checkbox(): CheckboxPlugin {
  return {
    id: "checkbox",
    default: {
      name: "Checkbox",
      icon: <DefaultIcon type="checkbox" />,
      data: false,
      config: NEVER,
    },
    fromReadableValue: () => false,
    toReadableValue: (data) => (data ? "1" : "0"),
    toTextValue: (data) => (data ? "✅" : ""),
    renderCell: ({ data, wrapped, onChange }) => (
      <CheckboxCell checked={data} wrapped={wrapped} onChange={onChange} />
    ),
    reducer: (v) => v,
  };
}
