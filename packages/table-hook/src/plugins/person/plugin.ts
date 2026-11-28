import {
  firstReferenceText,
  referenceFiltering,
  referenceMethods,
  referenceText,
  type PropertyReference,
} from "../references";
import type { CellPlugin } from "../types";
import { genericCounting } from "../utils";

export interface PersonConfig {
  limit: "one" | "unlimited";
  defaultValue: "none" | "created-by";
  notifications: "individuals" | "individuals-and-groups" | "none";
}

export interface PersonPluginOptions {
  accounts?: readonly PropertyReference[];
}

export type PersonPlugin = CellPlugin<
  "person",
  PropertyReference[],
  PersonConfig
>;
export type CreatedByPlugin = CellPlugin<
  "created-by",
  PropertyReference[],
  undefined
>;
export type LastEditedByPlugin = CellPlugin<
  "last-edited-by",
  PropertyReference[],
  undefined
>;

function personPlugin<
  Key extends "person" | "created-by" | "last-edited-by",
  Config,
>(
  id: Key,
  config: Config,
  { accounts }: PersonPluginOptions = {},
): CellPlugin<Key, PropertyReference[], Config> {
  const isEmpty = (data: PropertyReference[]) => data.length === 0;
  return {
    id,
    default: { data: [], config },
    fromValue: () => [],
    toValue: firstReferenceText,
    toTextValue: referenceText,
    isEmpty,
    ...referenceMethods<Config>(id === "person"),
    counting: genericCounting(isEmpty),
    filtering: referenceFiltering<Config>(
      ({ sources }) => accounts ?? sources?.people ?? [],
      id === "person",
    ),
    readOnly: id !== "person",
  };
}

export const person = (options?: PersonPluginOptions): PersonPlugin =>
  personPlugin<"person", PersonConfig>(
    "person",
    { limit: "unlimited", defaultValue: "none", notifications: "individuals" },
    options,
  );
export const createdBy = (options?: PersonPluginOptions): CreatedByPlugin =>
  personPlugin("created-by", undefined, options);
export const lastEditedBy = (
  options?: PersonPluginOptions,
): LastEditedByPlugin => personPlugin("last-edited-by", undefined, options);
