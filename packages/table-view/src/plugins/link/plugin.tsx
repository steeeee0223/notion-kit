import {
  email as createEmail,
  phone as createPhone,
  url as createUrl,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DefaultGroupingValue } from "../utils";
import { LinkCell } from "./link-cell";

export function email() {
  return createEmail({
    icon: <DefaultIcon type="email" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="email" />,
    renderCell: (props) => <LinkCell type="email" {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}

export function phone() {
  return createPhone({
    icon: <DefaultIcon type="phone" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="phone" />,
    renderCell: (props) => <LinkCell type="phone" {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}

export function url() {
  return createUrl({
    icon: <DefaultIcon type="url" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="url" />,
    renderCell: (props) => <LinkCell type="url" {...props} />,
    renderGroupingValue: (props) => <DefaultGroupingValue {...props} />,
  });
}
