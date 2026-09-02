import {
  type EmailPlugin,
  type PhonePlugin,
  type UrlPlugin,
} from "@notion-kit/table-hook/plugins";

import { CellRenderer, DefaultIcon } from "@/common";
import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";

import type { TableUiPlugin } from "../registry";
import {
  DefaultGroupingValue,
  getCellTriggerClass,
  getCompactWidthClass,
  getCopyClasses,
} from "../utils";
import { LinkCellEditor, LinkCellValue } from "./link-cell";

export function email(): TableUiPlugin<EmailPlugin> {
  const renderCell = (
    props: Parameters<TableUiPlugin<EmailPlugin>["renderCell"]>[0],
  ) => renderLinkCell("email", props);
  return {
    id: "email",
    meta: {
      name: "Email",
      desc: "Accepts an email address and launches your mail client when clicked.",
      icon: <DefaultIcon type="email" className="fill-menu-icon" />,
    },
    default: { name: "Email", icon: <DefaultIcon type="email" /> },
    renderCell,
    renderBulkEditor: (props) => <LinkBulkEditor {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

export function phone(): TableUiPlugin<PhonePlugin> {
  const renderCell = (
    props: Parameters<TableUiPlugin<PhonePlugin>["renderCell"]>[0],
  ) => renderLinkCell("phone", props);
  return {
    id: "phone",
    meta: {
      name: "Phone",
      desc: "Accepts a phone number and prompts your device to call it when clicked.",
      icon: <DefaultIcon type="phone" className="fill-menu-icon" />,
    },
    default: { name: "Phone", icon: <DefaultIcon type="phone" /> },
    renderCell,
    renderBulkEditor: (props) => <LinkBulkEditor {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

export function url(): TableUiPlugin<UrlPlugin> {
  const renderCell = (
    props: Parameters<TableUiPlugin<UrlPlugin>["renderCell"]>[0],
  ) => renderLinkCell("url", props);
  return {
    id: "url",
    meta: {
      name: "URL",
      desc: "Accepts a link to a website and opens the link in a new tab when clicked.",
      icon: <DefaultIcon type="url" className="fill-menu-icon" />,
    },
    default: { name: "URL", icon: <DefaultIcon type="url" /> },
    renderCell,
    renderBulkEditor: (props) => <LinkBulkEditor {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

function LinkBulkEditor(
  props: Parameters<
    NonNullable<TableUiPlugin<EmailPlugin>["renderBulkEditor"]>
  >[0],
) {
  return (
    <BulkEditorPopover {...props} initialData={props.data}>
      {(data, onChange) => (
        <LinkCellEditor data={data} onChange={onChange} commitOnUnchanged />
      )}
    </BulkEditorPopover>
  );
}

function renderLinkCell(
  type: "email" | "phone" | "url",
  props: Parameters<TableUiPlugin<EmailPlugin>["renderCell"]>[0],
) {
  const copy = getCopyClasses("link");
  return (
    <CellRenderer
      compactClassName={getCompactWidthClass("link")}
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
        <LinkCellEditor
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
        kind: "link",
        surface: props.surface,
        wrapped: props.wrapped,
      })}
      value={<LinkCellValue type={type} {...props} />}
    />
  );
}
