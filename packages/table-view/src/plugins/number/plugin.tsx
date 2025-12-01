import { z } from "zod/v4";

import { DefaultIcon } from "../../common";
import { compareNumbers, createCompareFn } from "../utils";
import { NumberCell } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu";
import type { NumberPlugin } from "./types";

const numberSchema = z
  .any()
  .refine((val) => !isNaN(Number(val)))
  .transform(String);

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
    fromValue: (value) => {
      const res = numberSchema.safeParse(value);
      return res.success ? res.data : null;
    },
    toValue: (data) => (data ? Number(data) : null),
    toTextValue: (data) => data ?? "",
    compare: createCompareFn<NumberPlugin>((a, b) => {
      if (a === null && b === null) return 0;
      // undefined sorts after defined values
      if (a === null) return 1;
      if (b === null) return -1;
      return compareNumbers(Number(a), Number(b));
    }),
    renderCell: (props) => <NumberCell {...props} />,
    renderConfigMenu: (props) => <NumberConfigMenu {...props} />,
    reducer: (v) => v,
  };
}
