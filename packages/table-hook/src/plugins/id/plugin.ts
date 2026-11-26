import { number } from "../number";
import type { CellPlugin } from "../types";
import { genericCounting } from "../utils";

export interface IdConfig {
  prefix: string;
}

export interface IdValue {
  number: number;
  prefix: string;
}

export type IdPlugin = CellPlugin<"id", IdValue | null, IdConfig>;

export function formatId(value: IdValue | null | undefined): string {
  if (!value) return "";
  return value.prefix
    ? `${value.prefix}-${value.number}`
    : String(value.number);
}

export function id(): IdPlugin {
  const numeric = number();
  const isEmpty = (data: IdValue | null) => data === null;
  return {
    id: "id",
    default: { data: null, config: { prefix: "" } },
    fromValue: () => null,
    toValue: (data) => data?.number ?? null,
    toTextValue: formatId,
    isEmpty,
    readOnly: true,
    canGroup: false,
    sorting: {
      defaultMethod: "number",
      methods: [
        {
          id: "number",
          name: "Number",
          ascendingLabel: "Low → high",
          descendingLabel: "High → low",
          toComparable: (data) => data?.number ?? null,
          sortFn: "number",
        },
      ],
    },
    filtering: {
      operators: numeric.filtering!.operators.map(
        ({ id, name, operand: metadata, matches }) => ({
          id,
          name,
          operand: metadata,
          matches: (data, row, _config, operand, context) =>
            matches(
              data ? String(data.number) : null,
              row,
              numeric.default.config,
              operand,
              context,
            ),
        }),
      ),
    },
    counting: genericCounting(isEmpty),
  };
}
