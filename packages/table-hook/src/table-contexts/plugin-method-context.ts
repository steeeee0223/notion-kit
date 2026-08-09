import type { _TableInstance } from "@/features/types";
import type { PluginMethodContext, Weekday } from "@/methods";

export function createRuntimePluginMethodContext<Config>(
  table: _TableInstance | null,
  colId: string,
  config: Config,
  weekStartsOn: Weekday,
): PluginMethodContext<Config> {
  return {
    table: table ?? ({} as _TableInstance),
    colId,
    config,
    weekStartsOn,
  };
}
