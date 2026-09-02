import { wrappedClassName } from "@notion-kit/table-hook";
import type {
  TitleConfig as TitleConfigData,
  TitlePlugin,
} from "@notion-kit/table-hook/plugins";
import { IconBlock } from "@notion-kit/ui/icon-block";

import { DefaultIcon } from "@/common";
import { CellTriggerScope } from "@/common/cell-trigger";

import type { TableUiPlugin } from "../registry";
import {
  createCellRenderer,
  createConfigMenuRenderer,
  type CellRendererProps,
  type ConfigMenuRendererProps,
} from "../renderers";
import { DefaultGroupingValue, getCellTriggerClass } from "../utils";
import { TitleCompactSlot, TitleTableSlot } from "./title-cell";
import { TitleConfig } from "./title-config";

export function title(): TableUiPlugin<TitlePlugin> {
  const renderCell = (props: CellRendererProps<string, TitleConfigData>) => {
    const icon = props.config.showIcon ? props.row.icon : undefined;
    const triggerClassName = getCellTriggerClass({
      kind: "text",
      surface: props.surface,
      wrapped: props.wrapped,
    });

    switch (props.surface) {
      case "table":
        return (
          <CellTriggerScope ariaLabel={props.data} className={triggerClassName}>
            <TitleTableSlot
              value={props.data}
              props={props}
              row={props.row}
              icon={icon}
            />
          </CellTriggerScope>
        );
      case "list":
        return (
          <div className="flex min-w-30 flex-[1_1_auto] empty:hidden">
            <CellTriggerScope
              className={triggerClassName}
              stopPropagation={false}
            >
              <TitleCompactSlot
                value={props.data}
                props={props}
                row={props.row}
                icon={icon}
              />
            </CellTriggerScope>
          </div>
        );
      case "timeline":
        return (
          <>
            {icon && <IconBlock icon={icon} className="contents" />}
            <span
              className={props.wrapped ? wrappedClassName(true) : "truncate"}
            >
              {props.data || "New page"}
            </span>
          </>
        );
      default:
        return null;
    }
  };
  return {
    id: "title",
    meta: {
      name: "Title",
      desc: "",
      icon: <DefaultIcon type="title" className="fill-menu-icon" />,
    },
    default: { name: "Title", icon: <DefaultIcon type="title" /> },
    disablePropertyTooltip: true,
    renderCell: createCellRenderer(renderCell),
    renderConfigMenu: createConfigMenuRenderer<TitlePlugin>(
      (props: ConfigMenuRendererProps<TitleConfigData>) => (
        <TitleConfig {...props} />
      ),
    ),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}
