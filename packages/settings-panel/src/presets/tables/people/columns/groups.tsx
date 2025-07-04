import type { ColumnDef } from "@tanstack/react-table";

import type { GroupOption } from "../../../../lib";
import { Header } from "../cells";

export const groupColumns: ColumnDef<GroupOption, GroupOption>[] = [
  {
    id: "group",
    accessorKey: "group",
    header: () => <Header title="Group" className="text-sm" />,
  },
  {
    id: "members",
    accessorKey: "members",
    header: () => <Header title="Members" className="text-sm" />,
  },
];
