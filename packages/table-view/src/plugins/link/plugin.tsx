import {
  email as createEmail,
  phone as createPhone,
  url as createUrl,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import { LinkCellEditor, LinkCellValue } from "./link-cell";

export function email() {
  return createEmail({
    icon: <DefaultIcon type="email" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="email" />,
    renderCellValue: (props) => <LinkCellValue type="email" {...props} />,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <LinkCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (triggerRect) => -triggerRect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}

export function phone() {
  return createPhone({
    icon: <DefaultIcon type="phone" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="phone" />,
    renderCellValue: (props) => <LinkCellValue type="phone" {...props} />,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <LinkCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (triggerRect) => -triggerRect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}

export function url() {
  return createUrl({
    icon: <DefaultIcon type="url" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="url" />,
    renderCellValue: (props) => <LinkCellValue type="url" {...props} />,
    renderCellEditor: (props) => ({
      presentation: "popover",
      content: <LinkCellEditor {...props} />,
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: (triggerRect) => -triggerRect.height,
        className:
          "max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none",
      },
    }),
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}
