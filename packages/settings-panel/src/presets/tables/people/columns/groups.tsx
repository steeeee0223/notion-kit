import type { ColumnDef } from "@tanstack/react-table";

import type { GroupOption } from "../../../../lib";
import { TextCell } from "../../common-cells";

export const groupColumns: ColumnDef<GroupOption>[] = [
  {
    id: "group",
    accessorKey: "group",
    header: () => <TextCell value="Group" />,
  },
  {
    id: "members",
    accessorKey: "members",
    header: () => <TextCell value="Members" />,
  },
];
