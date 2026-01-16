"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useLocalStorage } from "usehooks-ts";

import { COLOR } from "@notion-kit/common/colors";
import type { LucideName } from "@notion-kit/icon-block";
import { randomItem } from "@notion-kit/utils";

type IconTag = [name: LucideName, tags: string[]];

interface UseLucideIconsOptions {
  onSelect: (name: LucideName, color: string) => void;
}

export const useLucideIcons = ({ onSelect }: UseLucideIconsOptions) => {
  const [isLoading, startTransition] = useTransition();
  /** Metadata for Lucide icons */
  const allIcons = useMemo(
    () => Object.keys(dynamicIconImports) as LucideName[],
    [],
  );
  const [tags, setTags] = useState<IconTag[]>([]);
  /** Filtered icons */
  const [search, setSearch] = useState("");
  const [color, setColor] = useState<string>(COLOR.default);
  const [icons, setIcons] = useState(allIcons);
  const filterIcons = (value: string) => {
    setSearch(value);
    setIcons(
      value.length > 0
        ? tags
            .filter(([name, keywords]) =>
              value
                .toLowerCase()
                .split(" ")
                .some((keyword) =>
                  [...name.split("-"), ...keywords].includes(keyword),
                ),
            )
            .map(([name]) => name)
        : allIcons,
    );
  };
  /** Recent icons */
  const [recentIcons, setRecentIcons] = useLocalStorage<LucideName[]>(
    "recent:lucide",
    [],
  );
  const updateRecentIcons = (iconName: LucideName) =>
    setRecentIcons((prev) => {
      // Remove existing icon
      const filteredIcons = prev.filter((name) => name !== iconName);
      // Insert to the front, and keep length ≤ 20
      return [iconName, ...filteredIcons].slice(0, 20);
    });
  const selectIcon = (name: LucideName) => {
    onSelect(name, color);
    updateRecentIcons(name);
  };
  const getRandomIcon = () => onSelect(randomItem(allIcons), color);

  useEffect(() => {
    const fetchTags = async () => {
      console.log("fetching tags for lucide icons");
      const res = await fetch("https://lucide.dev/api/tags");
      const data = (await res.json()) as Record<string, string[]>;
      setTags(Object.entries(data) as IconTag[]);
    };

    startTransition(() => void fetchTags());
  }, []);

  return {
    isLoading,
    search,
    color,
    icons,
    recentIcons,
    setColor,
    filterIcons,
    selectIcon,
    getRandomIcon,
  };
};
