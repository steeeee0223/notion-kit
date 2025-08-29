import type { Row } from "@tanstack/react-table";

import type { User } from "@notion-kit/schemas";

export function userFilterFn<T extends { user: User }>(
  row: Row<T>,
  _columnId: string,
  filterValue: unknown,
) {
  const { name, email } = row.original.user;
  return `${name}-${email}`
    .toLowerCase()
    .includes((filterValue as string).trim());
}
