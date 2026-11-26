import { z } from "zod";

import type { CellPlugin } from "../types";
import {
  genericCounting,
  textFilteringCapabilities,
  textMethodCapabilities,
} from "../utils";

export const locationValueSchema = z.object({
  name: z.string(),
  address: z.string(),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});
export type LocationValue = z.infer<typeof locationValueSchema>;
export type LocationPlugin = CellPlugin<
  "location",
  LocationValue | null,
  undefined
>;

export function locationLabel(data: LocationValue | null | undefined): string {
  if (!data) return "";
  return (
    data.name ||
    data.address ||
    (data.coordinates
      ? `${data.coordinates.latitude}, ${data.coordinates.longitude}`
      : "")
  );
}

export function location(): LocationPlugin {
  const isEmpty = (data: LocationValue | null) => !locationLabel(data).trim();
  const { sorting } = textMethodCapabilities();
  return {
    id: "location",
    default: { data: null, config: undefined },
    fromValue: (value) =>
      typeof value === "string" && value.trim()
        ? { name: "", address: value.trim() }
        : null,
    toValue: locationLabel,
    toTextValue: locationLabel,
    isEmpty,
    canGroup: false,
    sorting: {
      ...sorting,
      methods: sorting.methods.map((method) => ({
        ...method,
        toComparable: locationLabel,
      })),
    },
    filtering: {
      operators: textFilteringCapabilities((text) => !text.trim())
        .filtering.operators.filter(({ id }) =>
          ["contains", "does-not-contain", "is-empty", "is-not-empty"].includes(
            id,
          ),
        )
        .map((operator) => ({
          ...operator,
          matches: (data, row, config, value) =>
            operator.matches(
              data
                ? [data.name, data.address].filter(Boolean).join("\n") ||
                    locationLabel(data)
                : "",
              row,
              config,
              value,
            ),
        })),
    },
    counting: genericCounting(isEmpty),
  };
}
