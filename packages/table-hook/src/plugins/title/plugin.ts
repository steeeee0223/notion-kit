import type { Row } from "@/lib/types";
import type {
  CellEditorProps,
  CellEditorResult,
  CellPlugin,
  CellValueProps,
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
    "renderCellValue" | "renderCellEditor" | "renderConfigMenu"
  > {
  renderCellValue: (
    props: CellValueProps<string, TitleConfig> & { icon?: Row["icon"] },
  ) => React.ReactNode;
  renderCellEditor?: (
    props: CellEditorProps<string, TitleConfig> & { icon?: Row["icon"] },
  ) => CellEditorResult;
  renderConfigMenu?: (props: ConfigMenuProps<TitleConfig>) => React.ReactNode;
}

export function title(config: TitlePluginConfig): TitlePlugin {
  const renderCellEditor = config.renderCellEditor;
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
    renderCellValue: ({ row, config: pluginConfig, ...props }) =>
      config.renderCellValue({
        icon: pluginConfig.showIcon ? row.icon : undefined,
        row,
        config: pluginConfig,
        ...props,
      }),
    renderCellEditor: renderCellEditor
      ? ({ scope, config: pluginConfig, ...props }) =>
          renderCellEditor({
            icon:
              scope.kind === "cell" && pluginConfig.showIcon
                ? scope.row.icon
                : undefined,
            config: pluginConfig,
            scope,
            ...props,
          })
      : undefined,
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}
