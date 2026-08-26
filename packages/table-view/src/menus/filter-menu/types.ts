import type { FilterRule } from "@notion-kit/table-hook";

import type { useTableViewCtx } from "@/table-contexts";

export type DefaultFilterRule = Pick<FilterRule, "propertyId" | "operator">;
export type FilterProperty = ReturnType<
  ReturnType<typeof useTableViewCtx>["table"]["atoms"]["columnsInfo"]["get"]
>[string];
