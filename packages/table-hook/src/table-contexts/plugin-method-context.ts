import type { _TableInstance } from "@/features/types";
import type { PluginMethodContext, Weekday } from "@/methods";

export function createRuntimePluginMethodContext<Config>(
  table: _TableInstance | (() => _TableInstance | null),
  colId: string,
  config: Config,
  weekStartsOn: Weekday,
): PluginMethodContext<Config> {
  return {
    get table() {
      const instance = typeof table === "function" ? table() : table;
      if (!instance) {
        throw new Error("[TableView] Plugin method ran before table setup.");
      }
      return instance;
    },
    colId,
    config,
    weekStartsOn,
  };
}
