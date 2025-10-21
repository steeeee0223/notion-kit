import { z } from "zod/v4";

import { DefaultIcon } from "../../common";
import { DEFAULT_CONFIG } from "./constant";
import { NumberCell } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu/number-config-menu";
import type { NumberPlugin } from "./types";

const numberSchema = z.string().refine((val) => !isNaN(Number(val)));

export function number(): NumberPlugin {
  return {
    id: "number",
    default: {
      name: "Number",
      icon: <DefaultIcon type="number" />,
      data: "",
      config: DEFAULT_CONFIG,
    },
    fromReadableValue: (value) => {
      const res = numberSchema.safeParse(value);
      return res.success ? value : null;
    },
    toReadableValue: (data) => data ?? "",
    toTextValue: (data) => data ?? "",
    renderCell: ({ data, config, wrapped, onChange }) => data,
    renderConfigMenu: (props) => <NumberConfigMenu {...props} />,
    reducer: (v) => v,
  };
}
