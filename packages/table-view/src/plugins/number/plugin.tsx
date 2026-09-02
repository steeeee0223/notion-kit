import type { NumberPlugin } from "@notion-kit/table-hook/plugins";

import { CellRenderer, DefaultIcon } from "@/common";
import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";

import type { TableUiPlugin } from "../registry";
import {
  getCellTriggerClass,
  getCompactWidthClass,
  getCopyClasses,
} from "../utils";
import { NumberCellEditor, NumberCellValue } from "./number-cell";
import { NumberConfigMenu } from "./number-config-menu";
import { NumberGroupingValue } from "./number-grouping-value";

export function number(): TableUiPlugin<NumberPlugin> {
  const renderCell = (
    props: Parameters<TableUiPlugin<NumberPlugin>["renderCell"]>[0],
  ) => {
    const copy = getCopyClasses("number");
    return (
      <CellRenderer
        compactClassName={getCompactWidthClass("number")}
        copyButtonClassName={copy.copyHoverClassName}
        copyClassName={copy.copyGroupClassName}
        copyValue={props.surface === "table" ? props.textValue : undefined}
        disabled={props.disabled}
        emptyContent={
          props.surface === "row-view" && props.data === null ? (
            <div
              className={
                props.wrapped
                  ? "flex flex-wrap justify-end gap-x-2 gap-y-1.5 text-muted"
                  : "flex flex-nowrap justify-end gap-x-2 gap-y-1.5 text-muted"
              }
            >
              Empty
            </div>
          ) : undefined
        }
        hideWhenEmpty={props.surface === "list" || props.surface === "board"}
        isEmpty={props.data === null}
        popover={{
          align: "start",
          side: "bottom",
          sideOffset: (rect) => -rect.height,
          className:
            "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
        }}
        renderEditor={(close) => (
          <NumberCellEditor
            data={props.data}
            onChange={(updater) => {
              props.onChange(updater);
              close();
            }}
            onCancel={close}
          />
        )}
        surface={props.surface}
        triggerClassName={getCellTriggerClass({
          kind: "number",
          surface: props.surface,
          wrapped: props.wrapped,
        })}
        value={<NumberCellValue {...props} />}
      />
    );
  };
  return {
    id: "number",
    meta: {
      name: "Number",
      desc: "Accepts numbers. These can also be formatted as currency or progress bars. Useful for tracking counts, prices and completion.",
      icon: <DefaultIcon type="number" className="fill-menu-icon" />,
    },
    default: { name: "Number", icon: <DefaultIcon type="number" /> },
    renderCell,
    renderBulkEditor: (props) => (
      <BulkEditorPopover {...props} initialData={props.data}>
        {(data, onChange) => (
          <NumberCellEditor data={data} onChange={onChange} commitOnUnchanged />
        )}
      </BulkEditorPopover>
    ),
    renderConfigMenu: (props) => <NumberConfigMenu {...props} />,
    renderGroupingValue: (props) => <NumberGroupingValue {...props} />,
  };
}
