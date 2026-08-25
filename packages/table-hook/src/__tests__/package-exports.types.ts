import type {
  AdvancedFilteringTableApi,
  FilterEvaluationContext,
  FilterGroup,
  FilterLogic,
  FilterOperandMetadata,
  FilterOperatorDescriptor,
  FilterRule,
  FilterValue,
  TableFilterState,
} from "@notion-kit/table-hook";

const logic = "and" satisfies FilterLogic;
const value = {
  query: "alpha",
  options: [1, true, null],
} satisfies FilterValue;
const rule = {
  kind: "rule",
  id: "rule",
  propertyId: "title",
  operator: "contains",
  value,
} satisfies FilterRule;
const group = {
  kind: "group",
  id: "root",
  logic,
  children: [rule],
} satisfies FilterGroup;
const state: TableFilterState = group;
const context = { now: 0 } satisfies FilterEvaluationContext;
const operand = { kind: "text" } satisfies FilterOperandMetadata;
const operator = {
  id: "matches",
  name: "Matches",
  operand,
  matches: () => true,
} satisfies FilterOperatorDescriptor<unknown, undefined>;
const api = {
  getFilters: () => state,
  setFilters: () => undefined,
  clearFilters: () => undefined,
  validateFilters: (candidate: unknown): candidate is TableFilterState =>
    candidate === null || typeof candidate === "object",
} satisfies AdvancedFilteringTableApi;

void [context, operator, api];
