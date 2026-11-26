import {
  referenceFiltering,
  referenceMethods,
  referenceText,
  type PropertyReference,
} from "../references";
import type { CellPlugin } from "../types";
import { genericCounting } from "../utils";

export interface RelationConfig {
  databaseId: string;
  limit: "one" | "unlimited";
  reciprocalPropertyId?: string;
  displayPropertyIds?: string[];
}
export type RelationPlugin = CellPlugin<
  "relation",
  PropertyReference[],
  RelationConfig
>;

export function relation(): RelationPlugin {
  const isEmpty = (data: PropertyReference[]) => data.length === 0;
  return {
    id: "relation",
    default: { data: [], config: { databaseId: "", limit: "unlimited" } },
    fromValue: () => [],
    toValue: (data) => referenceText(data.slice(0, 1)),
    toTextValue: referenceText,
    isEmpty,
    ...referenceMethods<RelationConfig>(),
    counting: genericCounting(isEmpty),
    filtering: referenceFiltering<RelationConfig>(
      ({ config, getRelatedRows }) => {
        const { databaseId } = config as RelationConfig;
        return getRelatedRows?.(databaseId) ?? [];
      },
      false,
    ),
  };
}
