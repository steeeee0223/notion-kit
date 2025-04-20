"use client";

import { useEffect, useState } from "react";

interface UseFilterOptions {
  default?: "all" | "empty";
}

export function useFilter<T>(
  data: T[],
  predicate: (item: T, value: string) => boolean,
  options: UseFilterOptions = { default: "all" },
) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<T[] | null>(null);
  const updateFilteredItems = (input: string) => {
    const value = input.trim().toLowerCase();
    const filtered = data.filter((item) => predicate(item, value));
    setResults(
      value.length > 0
        ? filtered.length > 0
          ? filtered
          : null
        : options.default === "all"
          ? data
          : null,
    );
  };
  const updateSearch = (input: string) => {
    setSearch(input);
    updateFilteredItems(input);
  };

  useEffect(() => {
    setResults(options.default === "all" ? data : null);
  }, [options.default, data]);

  return {
    search,
    results,
    updateSearch,
  };
}
