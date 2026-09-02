import type { TextPlugin } from "@notion-kit/table-hook/plugins";

import { CellRenderer, DefaultIcon } from "@/common";
import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";

import type { TableUiPlugin } from "../registry";
import {
  DefaultGroupingValue,
  getCellTriggerClass,
  getCompactWidthClass,
  getCopyClasses,
} from "../utils";
import { TextCellEditor, TextCellValue } from "./text-cell";

export function text(): TableUiPlugin<TextPlugin> {
  const renderCell = (
    props: Parameters<TableUiPlugin<TextPlugin>["renderCell"]>[0],
  ) => {
    const copy = getCopyClasses("text");
    return (
      <CellRenderer
        compactClassName={getCompactWidthClass("text")}
        copyButtonClassName={copy.copyHoverClassName}
        copyClassName={copy.copyGroupClassName}
        copyValue={
          props.surface === "table" || props.surface === "row-view"
            ? props.textValue
            : undefined
        }
        disabled={props.disabled}
        emptyContent={
          props.surface === "row-view" && !props.data ? (
            <div className="leading-normal text-muted">Empty</div>
          ) : undefined
        }
        hideWhenEmpty={props.surface === "list" || props.surface === "board"}
        isEmpty={!props.data}
        popover={{
          align: "start",
          side: "bottom",
          sideOffset: (rect) => -rect.height,
          className:
            "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
        }}
        renderEditor={(close) => (
          <TextCellEditor
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
          kind: "text",
          surface: props.surface,
          wrapped: props.wrapped,
        })}
        value={<TextCellValue {...props} />}
      />
    );
  };
  return {
    id: "text",
    meta: {
      name: "Text",
      desc: "Add text that can be formatted. Great for summaries, notes, or descriptions.",
      icon: <DefaultIcon type="text" className="fill-menu-icon" />,
    },
    default: { name: "Text", icon: <DefaultIcon type="text" /> },
    renderCell,
    renderBulkEditor: (props) => (
      <BulkEditorPopover {...props} initialData={props.data}>
        {(data, onChange) => (
          <TextCellEditor data={data} onChange={onChange} commitOnUnchanged />
        )}
      </BulkEditorPopover>
    ),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}
