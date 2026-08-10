import type { AggregationFnDef } from "@tanstack/table-core";

export type CommonAggregationFn<TResult = unknown> = AggregationFnDef<
  // Common functions intentionally do not depend on a concrete table feature set.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  unknown,
  TResult
>;
