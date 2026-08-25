import type { ColumnInfo, Row } from "@/lib/types";
import type {
  CellPlugin,
  FilterEvaluationContext,
  FilterValue,
} from "@/plugins";

export type { FilterValue } from "@/plugins";

export interface FilterRule {
  kind: "rule";
  id: string;
  propertyId: string;
  operator: string;
  value?: FilterValue;
}

export interface FilterGroup {
  kind: "group";
  id: string;
  logic: "and" | "or";
  children: (FilterRule | FilterGroup)[];
}

export type TableFilterState = FilterGroup | null;

function isPlainRecord(value: object) {
  const prototype = Reflect.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOwnDataShape(
  value: object,
  requiredKeys: readonly string[],
  optionalKeys: readonly string[] = [],
) {
  const allowedKeys = new Set([...requiredKeys, ...optionalKeys]);
  const ownKeys = Reflect.ownKeys(value);
  const ownStringKeys = new Set<string>();
  for (const key of ownKeys) {
    if (typeof key !== "string" || !allowedKeys.has(key)) return false;
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor?.enumerable !== true || !("value" in descriptor)) {
      return false;
    }
    ownStringKeys.add(key);
  }
  return requiredKeys.every((key) => ownStringKeys.has(key));
}

function isDensePlainArray(value: unknown): value is unknown[] {
  if (
    !Array.isArray(value) ||
    Reflect.getPrototypeOf(value) !== Array.prototype
  ) {
    return false;
  }
  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1 || !keys.includes("length"))
    return false;
  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
    if (descriptor?.enumerable !== true || !("value" in descriptor)) {
      return false;
    }
  }
  return true;
}

function isJsonFilterValue(
  value: unknown,
  ancestors = new WeakSet<object>(),
): value is FilterValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (ancestors.has(value)) return false;
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return (
        isDensePlainArray(value) &&
        value.every((item) => isJsonFilterValue(item, ancestors))
      );
    }
    if (!isPlainRecord(value)) return false;
    const keys = Reflect.ownKeys(value);
    const stringKeys = keys.filter(
      (key): key is string => typeof key === "string",
    );
    if (
      stringKeys.length !== keys.length ||
      !hasOwnDataShape(value, stringKeys)
    ) {
      return false;
    }
    return keys.every((key) => {
      if (typeof key !== "string") return false;
      const descriptor = Reflect.getOwnPropertyDescriptor(value, key);
      return isJsonFilterValue(descriptor?.value, ancestors);
    });
  } finally {
    ancestors.delete(value);
  }
}

function isRule(value: unknown): value is FilterRule {
  if (
    typeof value !== "object" ||
    value === null ||
    !isPlainRecord(value) ||
    !hasOwnDataShape(value, ["kind", "id", "propertyId", "operator"], ["value"])
  )
    return false;
  const candidate = value as Partial<FilterRule>;
  return (
    candidate.kind === "rule" &&
    typeof candidate.id === "string" &&
    typeof candidate.propertyId === "string" &&
    typeof candidate.operator === "string" &&
    (!Object.hasOwn(candidate, "value") || isJsonFilterValue(candidate.value))
  );
}

function isGroup(
  value: unknown,
  depth: number,
  ancestors = new WeakSet<object>(),
): value is FilterGroup {
  if (
    depth > 3 ||
    typeof value !== "object" ||
    value === null ||
    !isPlainRecord(value) ||
    !hasOwnDataShape(value, ["kind", "id", "logic", "children"]) ||
    ancestors.has(value)
  )
    return false;
  ancestors.add(value);
  try {
    const candidate = value as Partial<FilterGroup>;
    return (
      candidate.kind === "group" &&
      typeof candidate.id === "string" &&
      (candidate.logic === "and" || candidate.logic === "or") &&
      isDensePlainArray(candidate.children) &&
      candidate.children.every(
        (child) => isRule(child) || isGroup(child, depth + 1, ancestors),
      )
    );
  } finally {
    ancestors.delete(value);
  }
}

export function validateTableFilterState(
  value: unknown,
): value is TableFilterState {
  try {
    return value === null || isGroup(value, 1);
  } catch {
    return false;
  }
}

function evaluateValidatedTableFilter(
  state: TableFilterState,
  row: Row,
  properties: Record<string, ColumnInfo>,
  plugins: Record<string, CellPlugin>,
  context: FilterEvaluationContext,
): boolean {
  if (state === null || state.children.length === 0) return true;

  const evaluate = (node: FilterRule | FilterGroup): boolean => {
    if (node.kind === "group") {
      if (node.children.length === 0) return true;
      return node.logic === "and"
        ? node.children.every(evaluate)
        : node.children.some(evaluate);
    }

    const property = properties[node.propertyId];
    if (!property || property.isDeleted) return false;
    const plugin = plugins[property.type];
    const operator = plugin?.filtering?.operators.find(
      ({ id }) => id === node.operator,
    );
    if (!plugin || !operator) return false;
    const cell = row.properties[node.propertyId];
    return operator.matches(
      cell?.value,
      row,
      property.config,
      node.value,
      context,
    );
  };

  return evaluate(state);
}

export function evaluateTableFilter(
  state: unknown,
  row: Row,
  properties: Record<string, ColumnInfo>,
  plugins: Record<string, CellPlugin>,
  context: FilterEvaluationContext,
): boolean {
  return (
    validateTableFilterState(state) &&
    evaluateValidatedTableFilter(state, row, properties, plugins, context)
  );
}
