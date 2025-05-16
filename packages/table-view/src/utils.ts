import { v4 } from "uuid";

import type { CellDataType, CellType, Option, PropertyType } from "./types";

export function getDefaultCell(type: PropertyType): CellDataType {
  switch (type) {
    case "checkbox":
      return { type, id: v4(), checked: false };
    case "select":
      return { type, id: v4(), select: null };
    default:
      return { type, id: v4(), value: "" };
  }
}

export function getUniqueName(name: string, names: string[]) {
  const namesSet = new Set(names);
  let uniqueName = name;
  let suffix = 1;

  while (namesSet.has(uniqueName)) {
    uniqueName = `${name} ${suffix}`;
    suffix++;
  }
  return uniqueName;
}

export function transferPropertyValues(
  src: CellDataType,
  dest: PropertyType,
): CellDataType {
  switch (dest) {
    case "title":
    case "text":
      return { type: dest, id: src.id, value: toTextValue(src) };
    case "checkbox":
      return { type: dest, id: src.id, checked: toCheckboxValue(src) };
    case "select":
      return { type: dest, id: src.id, select: toSelectValue(src) };
  }
}

function toTextValue(src: CellType): string {
  switch (src.type) {
    case "text":
      return src.value;
    case "select":
      return src.select?.name ?? "";
    default:
      return "";
  }
}

function toCheckboxValue(src: CellType): boolean {
  switch (src.type) {
    case "checkbox":
      return src.checked;
    default:
      return false;
  }
}

function toSelectValue(src: CellType): Option | null {
  switch (src.type) {
    case "select":
      return src.select;
    default:
      return null;
  }
}
