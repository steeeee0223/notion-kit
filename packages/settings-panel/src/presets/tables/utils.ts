import type { User } from "@notion-kit/schemas";

import type { Row } from "./table-features";

export function userFilterFn<T extends { user: User }>(
  row: Row<T>,
  _columnId: string,
  filterValue: unknown,
) {
  const { name, email } = row.original.user;
  return `${name}-${email}`.toLowerCase().includes(String(filterValue).trim());
}
