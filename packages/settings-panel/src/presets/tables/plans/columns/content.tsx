import type { ColumnDef } from "@tanstack/react-table";

import { Plan } from "@notion-kit/schemas";

import { ContentCell, type ContentCellProps } from "../cells";

export interface ContentPlanRow
  extends Omit<Record<Plan, ContentCellProps>, Plan.EDUCATION> {
  title: string;
}

export const contentColumns: ColumnDef<ContentPlanRow>[] = [
  {
    accessorKey: "title",
    header: () => null,
    cell: ({ row }) => (
      <div className="max-w-[118px] min-w-0 p-3">{row.original.title}</div>
    ),
  },
  ...Object.values(Plan)
    .filter((plan) => plan !== Plan.EDUCATION)
    .map<ColumnDef<ContentPlanRow>>((plan) => ({
      accessorKey: plan,
      header: () => null,
      cell: ({ row }) => <ContentCell {...row.original[plan]} />,
    })),
];
