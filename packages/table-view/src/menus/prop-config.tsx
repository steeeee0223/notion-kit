"use client";

import { useMemo } from "react";

import type { PropertyConfig } from "../lib/types";
import { defaultPlugins } from "../plugins";

interface PropConfigProps {
  propId: string;
  meta: PropertyConfig;
}

export function PropConfig({ propId, meta }: PropConfigProps) {
  const comp = useMemo(
    () =>
      defaultPlugins.items[meta.type].renderConfigMenu?.({
        propId,
        config: meta.config,
      }),
    [propId, meta],
  );
  return comp;
}
