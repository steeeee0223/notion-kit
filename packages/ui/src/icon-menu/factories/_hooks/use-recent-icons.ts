"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

type FrequencyMap = Record<string, number>;

export interface UseRecentIconsOptions {
  storageKey: string;
  maxLimit?: number;
  /**
   * Tracking strategy:
   * - `"recency"`: most-recently-used order  (MRU stack)
   * - `"frequency"`: sorted by usage count   (most used first)
   *
   * @default "recency"
   */
  strategy?: "recency" | "frequency";
}

export interface UseRecentIconsResult {
  recentIds: string[];
  trackRecent: (id: string) => void;
}

export function useRecentIcons(
  options: UseRecentIconsOptions,
): UseRecentIconsResult {
  const { storageKey, maxLimit = 20, strategy = "recency" } = options;

  // ── Recency strategy ──
  // Stores a plain string[] ordered by most-recently-used first.
  const [recencyList, setRecencyList] = useLocalStorage<string[]>(
    `${storageKey}:list`,
    [],
  );

  // ── Frequency strategy ──
  // Stores a Record<string, number> (iconId → count), sorted on read.
  const [frequencyMap, setFrequencyMap] = useLocalStorage<FrequencyMap>(
    `${storageKey}:freq`,
    {},
  );

  const recentIds = useMemo(() => {
    if (strategy === "recency") {
      return recencyList.slice(0, maxLimit);
    }

    // Frequency: sort by count descending, take top N
    return Object.entries(frequencyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxLimit)
      .map(([id]) => id);
  }, [strategy, recencyList, frequencyMap, maxLimit]);

  const trackRecent = useCallback(
    (id: string) => {
      if (strategy === "recency") {
        setRecencyList((prev) => {
          const filtered = prev.filter((item) => item !== id);
          return [id, ...filtered].slice(0, maxLimit);
        });
      } else {
        setFrequencyMap((prev) => ({
          ...prev,
          [id]: (prev[id] ?? 0) + 1,
        }));
      }
    },
    [strategy, maxLimit, setRecencyList, setFrequencyMap],
  );

  return { recentIds, trackRecent };
}
