import { functionalUpdate } from "@tanstack/react-table";
import { z } from "zod/v4";

import { DefaultIcon } from "../../common";
import type { ColumnInfo } from "../../lib/types";
import type { TableDataAtom } from "../types";
import { NumberCell } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu";
import type { NumberActions, NumberPlugin } from "./types";

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
      data: "",
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
    renderCell: ({ data, config, wrapped, onChange }) => (
      <NumberCell
        value={data ?? ""}
        config={config}
        wrapped={wrapped}
        onUpdate={onChange}
      />
    ),
    renderConfigMenu: (props) => <NumberConfigMenu {...props} />,
    reducer: numberReducer, // currently not using
  };
}

function numberReducer(v: TableDataAtom, a: NumberActions): TableDataAtom {
  const prop = v.properties[a.id] as ColumnInfo<NumberPlugin>;
  const config = functionalUpdate(a.updater, prop.config);
  const properties = { ...v.properties, [a.id]: { ...prop, config } };
  return { ...v, properties };
}
