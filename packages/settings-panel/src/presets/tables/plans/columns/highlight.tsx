import type { ColumnDef } from "@tanstack/react-table";

import { Plan } from "@notion-kit/schemas";
import { Button, TooltipPreset, TooltipProvider } from "@notion-kit/shadcn";

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
      <div className="p-3 font-medium">{row.original.title}</div>
    ),
  },
  {
    accessorKey: Plan.FREE,
    header: () => (
      <PlanHeader title={"Free"} description={"$0 per member / month"} />
    ),
    cell: ({ row }) => <ListCell items={row.original.free} />,
  },
  {
    accessorKey: Plan.PLUS,
    header: () => (
      <TooltipProvider>
        <PlanHeader
          title={"Plus"}
          description={"$10 per member / month billed annually"}
          subtext="$12 billed monthly"
        >
          <TooltipPreset
            description="Only workspace owners can perform this action."
            className={canUpgrade ? "hidden" : "w-[174px]"}
          >
            <Button size="sm" className="h-7" disabled={!canUpgrade}>
              Upgrade
            </Button>
          </TooltipPreset>
        </PlanHeader>
      </TooltipProvider>
    ),
    cell: ({ row }) => <ListCell items={row.original.plus} />,
  },
  {
    accessorKey: Plan.BUSINESS,
    header: () => (
      <TooltipProvider>
        <PlanHeader
          title={"Business"}
          description={"$15 per member / month billed annually"}
          subtext="$18 billed monthly"
        >
          <TooltipPreset
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
          </TooltipPreset>
        </PlanHeader>
      </TooltipProvider>
    ),
    cell: ({ row }) => <ListCell items={row.original.business} />,
  },
  {
    accessorKey: Plan.ENTERPRISE,
    header: () => (
      <TooltipProvider>
        <PlanHeader
          title={"Enterprise"}
          description={"Contact Sales for pricing"}
        >
          <TooltipPreset
            description="Only workspace owners can perform this action."
            className={canUpgrade ? "hidden" : "w-[174px]"}
          >
            <Button size="sm" className="h-7" disabled={!canUpgrade}>
              Contact sales
            </Button>
          </TooltipPreset>
        </PlanHeader>
      </TooltipProvider>
    ),
    cell: ({ row }) => <ListCell items={row.original.enterprise} />,
  },
];
