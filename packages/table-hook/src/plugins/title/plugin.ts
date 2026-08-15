import type { Row } from "@/lib/types";
import type {
  CellPlugin,
  CellProps,
  ConfigMenuProps,
  PluginFactoryConfig,
} from "@/plugins";
import {
  compareStrings,
  createCompareFn,
  genericCounting,
  textMethodCapabilities,
} from "@/plugins/utils";

export interface TitleConfig {
  showIcon?: boolean;
}

export type TitlePlugin = CellPlugin<"title", string, TitleConfig>;

export interface TitlePluginConfig
  extends Omit<
    PluginFactoryConfig<TitlePlugin>,
    "renderCell" | "renderConfigMenu"
  > {
  renderCell: (
    props: CellProps<string, TitleConfig> & { icon?: Row["icon"] },
  ) => React.ReactNode;
  renderConfigMenu?: (props: ConfigMenuProps<TitleConfig>) => React.ReactNode;
}

export function title(config: TitlePluginConfig): TitlePlugin {
  return {
    id: "title",
    disableBulkEdit: true,
    meta: { name: "Title", icon: config.icon, desc: "" },
    default: {
      name: "Title",
      icon: config.defaultIcon ?? config.icon,
      data: "",
      config: { showIcon: true },
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    compare: createCompareFn(compareStrings),
    ...textMethodCapabilities<string>(),
    counting: genericCounting,
    renderCell: ({ row, config: pluginConfig, ...props }) =>
      config.renderCell({
        icon: pluginConfig.showIcon ? row.icon : undefined,
        row,
        config: pluginConfig,
        ...props,
      }),
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}
