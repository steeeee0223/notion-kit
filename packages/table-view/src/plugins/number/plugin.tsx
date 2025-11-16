import { z } from "zod/v4";

import { DefaultIcon } from "../../common";
import { NumberCell } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu";
import type { NumberPlugin } from "./types";

const numberSchema = z.string().refine((val) => !isNaN(Number(val)));

export function number(): NumberPlugin {
  return {
    id: "number",
    meta: {
      name: "Number",
      icon: <DefaultIcon type="number" className="fill-menu-icon" />,
      desc: "Accepts numbers. These can also be formatted as currency or progress bars. Useful for tracking counts, prices and completion.",
    },
    default: {
      name: "Number",
      icon: <DefaultIcon type="number" />,
      data: null,
      config: {
        format: "number",
        round: "default",
        showAs: "number",
        options: { color: "green", divideBy: 100, showNumber: true },
      },
    },
    fromReadableValue: (value) => {
      const res = numberSchema.safeParse(value);
      return res.success ? value : null;
    },
    toReadableValue: (data) => data ?? "",
    toTextValue: (data) => data ?? "",
    renderCell: (props) => <NumberCell {...props} />,
    renderConfigMenu: (props) => <NumberConfigMenu {...props} />,
    reducer: (v) => v,
  };
}
