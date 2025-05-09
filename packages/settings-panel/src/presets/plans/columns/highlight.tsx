import type { ColumnDef } from "@tanstack/react-table";

import { Hint, HintProvider } from "@notion-kit/common";
import { Plan } from "@notion-kit/schemas";
import { Button } from "@notion-kit/shadcn";

import { ListCell, PlanHeader } from "../cells";

export interface HighlightPlanRow
  extends Omit<Record<Plan, string[]>, Plan.EDUCATION> {
  title: string;
}

export const getHighlightColumns = (
  canUpgrade?: boolean,
): ColumnDef<HighlightPlanRow>[] => [
  {
    accessorKey: "title",
    header: () => <div className="w-[118px]" />,
    cell: ({ row }) => (
      <div className="p-3 font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: Plan.FREE,
    header: () => (
      <PlanHeader title={"Free"} description={"$0 per member / month"} />
    ),
    cell: ({ row }) => <ListCell items={row.getValue("free")} />,
  },
  {
    accessorKey: Plan.PLUS,
    header: () => (
      <HintProvider>
        <PlanHeader
          title={"Plus"}
          description={"$10 per member / month billed annually"}
          subtext="$12 billed monthly"
        >
          <Hint
            description="Only workspace owners can perform this action."
            className={canUpgrade ? "hidden" : "w-[174px]"}
          >
            <Button size="sm" className="h-7" disabled={!canUpgrade}>
              Upgrade
            </Button>
          </Hint>
        </PlanHeader>
      </HintProvider>
    ),
    cell: ({ row }) => <ListCell items={row.getValue("plus")} />,
  },
  {
    accessorKey: Plan.BUSINESS,
    header: () => (
      <HintProvider>
        <PlanHeader
          title={"Business"}
          description={"$15 per member / month billed annually"}
          subtext="$18 billed monthly"
        >
          <Hint
            description="Only workspace owners can perform this action."
            className={canUpgrade ? "hidden" : "w-[174px]"}
          >
            <Button
              variant="blue"
              size="sm"
              className="h-7"
              disabled={!canUpgrade}
            >
              Upgrade
            </Button>
          </Hint>
        </PlanHeader>
      </HintProvider>
    ),
    cell: ({ row }) => <ListCell items={row.getValue("business")} />,
  },
  {
    accessorKey: Plan.ENTERPRISE,
    header: () => (
      <HintProvider>
        <PlanHeader
          title={"Enterprise"}
          description={"Contact Sales for pricing"}
        >
          <Hint
            description="Only workspace owners can perform this action."
            className={canUpgrade ? "hidden" : "w-[174px]"}
          >
            <Button size="sm" className="h-7" disabled={!canUpgrade}>
              Contact sales
            </Button>
          </Hint>
        </PlanHeader>
      </HintProvider>
    ),
    cell: ({ row }) => <ListCell items={row.getValue("enterprise")} />,
  },
];
