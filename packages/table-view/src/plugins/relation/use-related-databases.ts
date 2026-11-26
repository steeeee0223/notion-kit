import { getLocalDatabase } from "@notion-kit/table-hook";

import { useTableViewCtx } from "@/table-contexts";

export function useRelatedDatabases() {
  const context = useTableViewCtx();
  const { table, propertySources } = context;
  const local = getLocalDatabase(
    propertySources,
    Object.values(table.atoms.columnsInfo.get()),
    table.getCellValues(),
    table.options.getRowUrl,
  );
  return {
    ...context,
    local,
    databases: [
      local,
      ...(propertySources?.databases?.filter(({ id }) => id !== local.id) ??
        []),
    ],
  };
}
