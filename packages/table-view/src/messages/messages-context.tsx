import { createContext, use, useMemo } from "react";

import { defaultTableViewMessages } from "./default-messages";
import type { DeepPartial, TableViewMessages } from "./types";

const TableViewMessagesContext = createContext<TableViewMessages>(
  defaultTableViewMessages,
);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Deep-merges a partial message override onto a base catalog. Functions and
 * non-plain-object values (arrays, class instances) are replaced wholesale
 * rather than merged.
 */
export function mergeTableViewMessages<T>(
  base: T,
  override?: DeepPartial<T>,
): T {
  if (!override) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override as T) ?? base;
  }
  const overrideObj: Record<string, unknown> = override;
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(overrideObj)) {
    const overrideValue = overrideObj[key];
    if (overrideValue === undefined) continue;
    result[key] = mergeTableViewMessages(
      (base as Record<string, unknown>)[key],
      overrideValue as DeepPartial<unknown>,
    );
  }
  return result as T;
}

export interface TableViewMessagesProviderProps {
  messages?: DeepPartial<TableViewMessages>;
  children?: React.ReactNode;
}

export function TableViewMessagesProvider({
  messages,
  children,
}: TableViewMessagesProviderProps) {
  const resolved = useMemo(
    () => mergeTableViewMessages(defaultTableViewMessages, messages),
    [messages],
  );

  return (
    <TableViewMessagesContext value={resolved}>
      {children}
    </TableViewMessagesContext>
  );
}

/**
 * Returns the resolved (default + override) message catalog for the closest
 * `<TableView>`. Falls back to `defaultTableViewMessages` when used outside a
 * `TableView` (e.g. in isolation tests), so it is always safe to call.
 */
export function useTableViewMessages(): TableViewMessages {
  return use(TableViewMessagesContext);
}
