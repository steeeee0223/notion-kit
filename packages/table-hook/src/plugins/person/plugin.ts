import {
  referenceFiltering,
  referenceMethods,
  referenceText,
  type PropertyReference,
} from "../references";
import type { CellPlugin } from "../types";
import { genericCounting } from "../utils";

export type PersonPlugin = CellPlugin<"person", PropertyReference[], undefined>;
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

function personPlugin<Key extends "person" | "created-by" | "last-edited-by">(
  id: Key,
): CellPlugin<Key, PropertyReference[], undefined> {
  const isEmpty = (data: PropertyReference[]) => data.length === 0;
  return {
    id,
    default: { data: [], config: undefined },
    fromValue: () => [],
    toValue: (data) => referenceText(data.slice(0, 1)),
    toTextValue: referenceText,
    isEmpty,
    ...referenceMethods<undefined>(id === "person"),
    counting: genericCounting(isEmpty),
    filtering: referenceFiltering<undefined>(
      ({ sources }) => sources?.people ?? [],
      id === "person",
    ),
    readOnly: id !== "person",
  };
}

export const person = (): PersonPlugin => personPlugin("person");
export const createdBy = (): CreatedByPlugin => personPlugin("created-by");
export const lastEditedBy = (): LastEditedByPlugin =>
  personPlugin("last-edited-by");
