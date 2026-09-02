import {
  type EmailPlugin,
  type PhonePlugin,
  type UrlPlugin,
} from "@notion-kit/table-hook/plugins";

import { CellRenderer, DefaultIcon, TextInputPopoverContent } from "@/common";
import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";

import type { TableUiPlugin } from "../registry";
import {
  createBulkEditorRenderer,
  createCellRenderer,
  type BulkEditorRendererProps,
  type CellRendererProps,
} from "../renderers";
import {
  DefaultGroupingValue,
  getCellTriggerClass,
  getCompactWidthClass,
  getCopyClasses,
} from "../utils";
import { LinkCellValue } from "./link-cell";

export function email(): TableUiPlugin<EmailPlugin> {
  const renderCell = (props: CellRendererProps<string>) =>
    renderLinkCell("email", props);
  return {
    id: "email",
    meta: {
      name: "Email",
      desc: "Accepts an email address and launches your mail client when clicked.",
      icon: <DefaultIcon type="email" className="fill-menu-icon" />,
    },
    default: { name: "Email", icon: <DefaultIcon type="email" /> },
    renderCell: createCellRenderer(renderCell),
    renderBulkEditor: createBulkEditorRenderer<EmailPlugin>((props) => (
      <LinkBulkEditor {...props} />
    )),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

export function phone(): TableUiPlugin<PhonePlugin> {
  const renderCell = (props: CellRendererProps<string>) =>
    renderLinkCell("phone", props);
  return {
    id: "phone",
    meta: {
      name: "Phone",
      desc: "Accepts a phone number and prompts your device to call it when clicked.",
      icon: <DefaultIcon type="phone" className="fill-menu-icon" />,
    },
    default: { name: "Phone", icon: <DefaultIcon type="phone" /> },
    renderCell: createCellRenderer(renderCell),
    renderBulkEditor: createBulkEditorRenderer<PhonePlugin>((props) => (
      <LinkBulkEditor {...props} />
    )),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

export function url(): TableUiPlugin<UrlPlugin> {
  const renderCell = (props: CellRendererProps<string>) =>
    renderLinkCell("url", props);
  return {
    id: "url",
    meta: {
      name: "URL",
      desc: "Accepts a link to a website and opens the link in a new tab when clicked.",
      icon: <DefaultIcon type="url" className="fill-menu-icon" />,
    },
    default: { name: "URL", icon: <DefaultIcon type="url" /> },
    renderCell: createCellRenderer(renderCell),
    renderBulkEditor: createBulkEditorRenderer<UrlPlugin>((props) => (
      <LinkBulkEditor {...props} />
    )),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

function LinkBulkEditor(props: BulkEditorRendererProps<string>) {
  return (
    <BulkEditorPopover {...props} initialData={props.data}>
      {(data, onChange) => (
        <TextInputPopoverContent
          value={data}
          onUpdate={onChange}
          commitOnUnchanged
        />
      )}
    </BulkEditorPopover>
  );
}

function renderLinkCell(
  type: "email" | "phone" | "url",
  props: CellRendererProps<string>,
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
        <TextInputPopoverContent
          value={props.data}
          onUpdate={(updater) => {
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
