import {
  type EmailPlugin,
  type PhonePlugin,
  type UrlPlugin,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import type { TableUiPlugin } from "../registry";
import { LinkCellEditor, LinkCellValue } from "./link-cell";

export function email(): TableUiPlugin<EmailPlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<EmailPlugin>["renderCell"]>[0]) => (
    <LinkCellValue type="email" {...props} />
  );
  return {
    id: "email",
    meta: { name: "Email", desc: "Accepts an email address and launches your mail client when clicked.", icon: <DefaultIcon type="email" className="fill-menu-icon" /> },
    default: { name: "Email", icon: <DefaultIcon type="email" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <LinkCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

export function phone(): TableUiPlugin<PhonePlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<PhonePlugin>["renderCell"]>[0]) => (
    <LinkCellValue type="phone" {...props} />
  );
  return {
    id: "phone",
    meta: { name: "Phone", desc: "Accepts a phone number and prompts your device to call it when clicked.", icon: <DefaultIcon type="phone" className="fill-menu-icon" /> },
    default: { name: "Phone", icon: <DefaultIcon type="phone" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <LinkCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}

export function url(): TableUiPlugin<UrlPlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<UrlPlugin>["renderCell"]>[0]) => (
    <LinkCellValue type="url" {...props} />
  );
  return {
    id: "url",
    meta: { name: "URL", desc: "Accepts a link to a website and opens the link in a new tab when clicked.", icon: <DefaultIcon type="url" className="fill-menu-icon" /> },
    default: { name: "URL", icon: <DefaultIcon type="url" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <LinkCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  };
}
