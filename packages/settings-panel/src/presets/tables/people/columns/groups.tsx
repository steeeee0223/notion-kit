import type { ColumnDef } from "@tanstack/react-table";

import { Trans } from "@notion-kit/i18n";

import type { GroupOption } from "@/lib/types";
import { TextCell } from "@/presets/tables/common-cells";

export const createGroupColumns = (): ColumnDef<GroupOption>[] => [
  {
    id: "group",
    accessorKey: "group",
    header: () => (
      <TextCell value={<Trans i18nKey="tables.people.columns.group" />} />
    ),
  },
  {
    id: "members",
    accessorKey: "members",
    header: () => (
      <TextCell value={<Trans i18nKey="tables.people.columns.members" />} />
    ),
  },
];
