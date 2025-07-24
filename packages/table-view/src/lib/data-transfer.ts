import { v4 } from "uuid";

import { getRandomColor } from "@notion-kit/utils";

import { SelectConfig } from "../plugins/select";
import type {
  CellDataType,
  CellType,
  ConfigMeta,
  DatabaseProperty,
  PropertyConfig,
  PropertyType,
  RowDataType,
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
      return { type: dest.type, id: src.id, data: toTextValue(src) };
    case "checkbox":
      return { type: dest.type, id: src.id, data: toCheckboxValue(src) };
    case "select":
      return { type: dest.type, id: src.id, data: toSelectValue(src, dest) };
    case "multi-select":
      return {
        type: dest.type,
        id: src.id,
        data: toMultiSelectValue(src, dest),
      };
  }
}

function toTextValue(src: CellType): string {
  switch (src.type) {
    case "title":
    case "text":
      return src.data;
    case "select":
      return src.data ?? "";
    case "multi-select":
      return src.data.join(", ");
    case "checkbox":
      return src.data ? "✅" : "";
    default:
      return "";
  }
}

export function toCheckboxValue(src: CellType): boolean {
  switch (src.type) {
    case "checkbox":
      return src.data;
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
): ConfigMeta<typeof type> {
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

function toSelectValue(
  src: CellType,
  dest: ConfigMeta<"select" | "multi-select">,
): string | null {
  switch (src.type) {
    case "text": {
      const option = dest.config.options.items[src.data];
      return option ? src.data : null;
    }
    case "select":
      return src.data;
    default:
      return null;
  }
}

function toMultiSelectValue(
  src: CellType,
  dest: ConfigMeta<"select" | "multi-select">,
): string[] {
  switch (src.type) {
    case "text": {
      return src.data.split(",").reduce<string[]>((acc, value) => {
        const option = dest.config.options.items[value];
        if (!option) return acc;
        acc.push(value);
        return acc;
      }, []);
    }
    case "multi-select":
      return src.data;
    case "select":
      return src.data ? [src.data] : [];
    default:
      return [];
  }
}

export function toReadableValue(src?: CellType): string {
  if (!src) return "";
  switch (src.type) {
    case "title":
    case "text":
      return src.data;
    case "checkbox":
      return src.data ? "1" : "0";
    case "select":
      return src.data ?? "";
    case "multi-select":
      return src.data.join(", ");
    default:
      return "";
  }
}
