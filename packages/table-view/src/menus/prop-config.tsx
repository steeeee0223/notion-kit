"use client";

import { useMemo } from "react";

import type { ColumnConfig } from "../lib/types";
import type { CellPlugin } from "../plugins";

interface PropConfigProps<TPlugin> {
  plugin: TPlugin;
  propId: string;
  meta: ColumnConfig<TPlugin>;
}

export function PropConfig<TPlugin extends CellPlugin>({
  plugin,
  propId,
  meta,
}: PropConfigProps<TPlugin>) {
  const comp = useMemo(
    () =>
      plugin.renderConfigMenu?.({
        propId,
        config: meta.config,
      }),
    [plugin, propId, meta.config],
  );
  return comp;
}
