import { functionalUpdate } from "@tanstack/react-table";
import { z } from "zod/v4";

import { DefaultIcon } from "../../common";
import type { ColumnInfo } from "../../lib/types";
import type { TableDataAtom } from "../types";
import { DEFAULT_CONFIG } from "./constant";
import { NumberConfigMenu } from "./number-config-menu";
import type { NumberActions, NumberPlugin } from "./types";

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
    renderCell: ({ data }) => data,
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
