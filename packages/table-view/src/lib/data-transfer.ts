import { v4 } from "uuid";

import { getRandomColor } from "@notion-kit/utils";

import type {
  CellDataType,
  CellType,
  DatabaseProperty,
  PropertyConfig,
  PropertyType,
  RowDataType,
  SelectConfig,
  SelectConfigMeta,
} from "./types";

interface OriginalData {
  property: DatabaseProperty;
  data: Record<string, RowDataType>;
}

export function transferPropertyConfig(
  src: OriginalData,
  dest: PropertyType,
): PropertyConfig {
  switch (dest) {
    case "title":
      return { type: dest, config: { showIcon: true } };
    case "select":
    case "multi-select":
      return toSelectConfig(src, dest);
    default:
      return { type: dest, config: undefined as never };
  }
}

export function transferPropertyValues(
  src: CellDataType,
  dest: PropertyConfig,
): CellDataType {
  switch (dest.type) {
    case "title":
    case "text":
      return { type: dest.type, id: src.id, value: toTextValue(src) };
    case "checkbox":
      return { type: dest.type, id: src.id, checked: toCheckboxValue(src) };
    case "select":
      return { type: dest.type, id: src.id, option: toSelectValue(src, dest) };
    case "multi-select":
      return {
        type: dest.type,
        id: src.id,
        options: toMultiSelectValue(src, dest),
      };
  }
}

function toTextValue(src: CellType): string {
  switch (src.type) {
    case "title":
    case "text":
      return src.value;
    case "select":
      return src.option ?? "";
    case "multi-select":
      return src.options.join(", ");
    case "checkbox":
      return src.checked ? "✅" : "";
    default:
      return "";
  }
}

export function toCheckboxValue(src: CellType): boolean {
  switch (src.type) {
    case "checkbox":
      return src.checked;
    default:
      return false;
  }
}

/**
 * Transfers the property configuration to "select" or "multi-select"
 */
function toSelectConfig(
  src: OriginalData,
  type: "select" | "multi-select",
): SelectConfigMeta {
  switch (src.property.type) {
    case "select":
    case "multi-select":
      return { type, config: src.property.config };
    case "text": {
      const options = Object.values(src.data).reduce<SelectConfig["options"]>(
        (acc, row) => {
          const name = toTextValue(row.properties[src.property.id]!).trim();
          if (!name) return acc;
          acc.names.push(name);
          acc.items[name] = { id: v4(), name, color: getRandomColor() };
          return acc;
        },
        { names: [], items: {} },
      );
      return { type, config: { sort: "manual", options } };
    }
    default:
      return {
        type,
        config: { options: { names: [], items: {} }, sort: "manual" },
      };
  }
}

function toSelectValue(src: CellType, dest: SelectConfigMeta): string | null {
  switch (src.type) {
    case "text": {
      const option = dest.config.options.items[src.value];
      return option ? src.value : null;
    }
    case "select":
      return src.option;
    default:
      return null;
  }
}

function toMultiSelectValue(src: CellType, dest: SelectConfigMeta): string[] {
  switch (src.type) {
    case "text": {
      return src.value.split(",").reduce<string[]>((acc, value) => {
        const option = dest.config.options.items[value];
        if (!option) return acc;
        acc.push(value);
        return acc;
      }, []);
    }
    case "multi-select":
      return src.options;
    case "select":
      return src.option ? [src.option] : [];
    default:
      return [];
  }
}

export function toReadableValue(src?: CellType): string {
  if (!src) return "";
  switch (src.type) {
    case "title":
    case "text":
      return src.value;
    case "checkbox":
      return src.checked ? "1" : "0";
    case "select":
      return src.option ?? "";
    case "multi-select":
      return src.options.join(", ");
    default:
      return "";
  }
}
