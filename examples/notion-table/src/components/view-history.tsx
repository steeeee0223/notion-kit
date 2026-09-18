import { useEffect, useEffectEvent } from "react";

import { useTableViewCtx } from "@notion-kit/table-view";

interface ViewHistoryProps {
  onSortingChange: () => void;
  onGroupingChange: (propertyId?: string) => void;
}

/** Sorting and grouping live in table atoms rather than view resource actions. */
export function ViewHistory({
  onSortingChange,
  onGroupingChange,
}: ViewHistoryProps) {
  const { table } = useTableViewCtx();
  const { atoms } = table;
  const recordSorting = useEffectEvent(onSortingChange);
  const recordGrouping = useEffectEvent(onGroupingChange);
  useEffect(() => {
    let sorting = atoms.sorting.get();
    let groupedId = atoms.grouping.get()[0];
    const sortingSubscription = atoms.sorting.subscribe(() => {
      const next = atoms.sorting.get();
      if (
        next.length === sorting.length &&
        next.every(
          (rule, index) =>
            rule.id === sorting[index]!.id &&
            rule.desc === sorting[index]!.desc,
        )
      )
        return;
      sorting = next;
      recordSorting();
    });
    const groupingSubscription = atoms.grouping.subscribe(() => {
      const next = atoms.grouping.get()[0];
      if (next === groupedId) return;
      groupedId = next;
      recordGrouping(next);
    });
    return () => {
      sortingSubscription.unsubscribe();
      groupingSubscription.unsubscribe();
    };
  }, [atoms]);
  return null;
}
