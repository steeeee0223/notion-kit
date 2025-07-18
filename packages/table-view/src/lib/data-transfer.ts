import { v4 } from "uuid";

import { getRandomColor } from "./colors";
import type {
  CellDataType,
  CellType,
  DatabaseProperty,
  Option,
  PropertyConfig,
  PropertyType,
  RowDataType,
  SelectConfig,
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
      return src.option?.name ?? "";
    case "multi-select":
      return src.options.map((o) => o.name).join(", ");
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
): SelectConfig {
  switch (src.property.type) {
    case "select":
    case "multi-select":
      return { type, config: src.property.config };
    case "text": {
      const options = Object.values(src.data).reduce<
        SelectConfig["config"]["options"]
      >(
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

function toSelectValue(src: CellType, dest: SelectConfig): Option | null {
  switch (src.type) {
    case "text":
      return dest.config.options.items[src.value] ?? null;
    case "select":
      return src.option;
    default:
      return null;
  }
}

function toMultiSelectValue(src: CellType, dest: SelectConfig): Option[] {
  switch (src.type) {
    case "text": {
      const options: Option[] = [];
      src.value.split(",").forEach((name) => {
        const option = dest.config.options.items[name];
        if (!option) return;
        options.push(option);
      });
      return options;
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
      return src.option?.name ?? "";
    case "multi-select":
      return src.options.map((o) => o.name).join(", ");
    default:
      return "";
  }
}
