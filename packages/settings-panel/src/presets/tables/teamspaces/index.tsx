import { memo, useMemo } from "react";

import { Scope, type TeamspaceRow } from "../../../lib";
import { createTeamspaceColumns } from "./columns";
import { DataTable } from "./data-table";

interface TeamspacesTableProps {
  data: TeamspaceRow[];
  workspace: string;
  scopes: Set<Scope>;
}

export const TeamspacesTable = memo<TeamspacesTableProps>(
  ({ data, workspace, scopes }) => {
    const columns = useMemo(
      () => createTeamspaceColumns({ workspace, scopes }),
      [workspace, scopes],
    );
    return <DataTable columns={columns} data={data} />;
  },
);
