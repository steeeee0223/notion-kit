import { z } from "zod";

import { groupByTextAlphabetical, groupByTextExact } from "@/fns";
import type { Row } from "@/lib/types";
import type { GroupingMethod } from "@/methods";

import type {
  CellPlugin,
  FilterOperandMetadata,
  FilterOperatorDescriptor,
} from "./types";
import { textMethodCapabilities } from "./utils";

export interface PropertyReference {
  id: string;
  name: string;
  avatarUrl?: string;
  href?: string;
}

const referenceSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    href: z.string().optional(),
  }),
);

export function readReferences(value: unknown): PropertyReference[] {
  const result = referenceSchema.safeParse(value);
  return result.success ? result.data : [];
}

export function referenceText(data: readonly PropertyReference[] = []) {
  return data.map(({ id, name }) => name || id).join(", ");
}

export function referenceMethods<Config>(editable = true) {
  const { sorting, grouping } = textMethodCapabilities();
  const getName = (data: PropertyReference[]) =>
    referenceText(data.slice(0, 1));
  const getDropValue: GroupingMethod<
    PropertyReference[],
    Config
  >["getDropValue"] = (data, value, { table, colId }) => {
    if (value === null) return [];
    const match = table
      .getPreGroupedRowModel()
      .rows.flatMap((row) =>
        readReferences(row.original.properties[colId]?.value),
      )
      .find((reference) => referenceText([reference]) === value);
    if (!match) return data;
    return [match, ...data.filter(({ id }) => id !== match.id)];
  };
  return {
    sorting: {
      ...sorting,
      methods: sorting.methods.map((method) => ({
        ...method,
        toComparable: getName,
      })),
    },
    grouping: {
      defaultMethod: grouping.defaultMethod,
      methods: [
        {
          id: "exact",
          name: "Exact",
          function: (data: PropertyReference[]) =>
            groupByTextExact(getName(data)),
          ...(editable && { getDropValue }),
        },
        {
          id: "alphabetical",
          name: "Alphabetical",
          function: (data: PropertyReference[]) =>
            groupByTextAlphabetical(getName(data)),
        },
      ],
    },
  } satisfies Pick<
    CellPlugin<string, PropertyReference[], Config>,
    "sorting" | "grouping"
  >;
}

export function referenceFiltering<Config>(
  getOptions: NonNullable<
    Extract<FilterOperandMetadata, { kind: "option" }>["getOptions"]
  >,
  multiple: boolean,
) {
  const membership = (
    id: string,
    name: string,
    inverted: boolean,
  ): FilterOperatorDescriptor<PropertyReference[], Config> => ({
    id,
    name,
    operand: { kind: "option", multiple, getOptions },
    matches: (data, _row: Row, _config, operand) => {
      const selected = Array.isArray(operand) ? operand : [operand];
      if (
        selected.length === 0 ||
        !selected.every((value) => typeof value === "string")
      )
        return false;
      return selected.every(
        (id) => data.some((reference) => reference.id === id) !== inverted,
      );
    },
  });
  return {
    operators: [
      membership("contains", "Contains", false),
      membership("does-not-contain", "Does not contain", true),
      {
        id: "is-empty",
        name: "Is empty",
        operand: { kind: "none" },
        matches: (data) => data.length === 0,
      },
      {
        id: "is-not-empty",
        name: "Is not empty",
        operand: { kind: "none" },
        matches: (data) => data.length > 0,
      },
    ],
  } satisfies NonNullable<
    CellPlugin<string, PropertyReference[], Config>["filtering"]
  >;
}
