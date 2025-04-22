"use client";

import { useDeferredValue, useMemo, useState } from "react";

interface UseFilterOptions {
  default?: "all" | "empty";
}

export function useFilter<T>(
  data: T[],
  predicate: (item: T, value: string) => boolean,
  options: UseFilterOptions = { default: "all" },
) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const results = useMemo(() => {
    if (deferredSearch.length > 0) {
      const filtered = data.filter((item) => predicate(item, deferredSearch));
      return filtered.length > 0 ? filtered : null;
    }
    return options.default === "all" ? data : null;
  }, [data, deferredSearch, predicate, options.default]);

  return {
    search,
    results,
    updateSearch: setSearch,
  };
}
