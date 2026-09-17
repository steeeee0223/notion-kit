import { render } from "@testing-library/react";

import { createFullPluginFixture } from "@/__tests__/mock";
import {
  DEFAULT_PLUGINS,
  type DefaultPlugins,
  type TablePluginPair,
} from "@/plugins";
import { TableViewWrapper } from "@/table-contexts";

import { ReadOnlyValue } from "../read-only-value";
import type { RowEditLog } from "../types";

export function snapshot(
  type: string,
  value: unknown,
  config?: unknown,
): RowEditLog {
  return {
    id: "log-snapshot",
    rowId: "row-alpha",
    editedAt: Date.UTC(2025, 0, 15),
    property: { id: "removed-property", name: "Historical name", type, config },
    value,
    textValue: "Historical fallback",
  };
}

export function renderReadOnlyValue(
  record: RowEditLog,
  plugins: TablePluginPair<DefaultPlugins> = DEFAULT_PLUGINS,
) {
  const fixture = createFullPluginFixture();
  return render(
    <TableViewWrapper {...fixture} plugins={plugins}>
      <ReadOnlyValue record={record} />
    </TableViewWrapper>,
  );
}
