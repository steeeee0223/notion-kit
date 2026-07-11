import type { CellPlugin } from "@notion-kit/table-hook";

import { DefaultIcon } from "@/common";

import { compareStrings, createCompareFn } from "../utils";
import { LinkCell } from "./link-cell";
import type { EmailPlugin, PhonePlugin, UrlPlugin } from "./types";

function createLinkPlugin<T extends "email" | "phone" | "url">(
  type: T,
): CellPlugin<T, string, undefined> {
  return {
    id: type,
    meta: {
      name: "",
      icon: <DefaultIcon type={type} className="fill-menu-icon" />,
      desc: "",
    },
    default: {
      name: "",
      icon: <DefaultIcon type={type} />,
      data: "",
      config: undefined,
    },
    compare: createCompareFn(compareStrings),
    fromValue: (value) => (typeof value === "string" ? value : ""),
    toValue: (data) => data,
    toTextValue: (data) => data,
    renderCell: (props) => <LinkCell type={type} {...props} />,
  };
}

export function email(): EmailPlugin {
  const plugin = createLinkPlugin("email");
  const name = "Email";
  return {
    ...plugin,
    meta: {
      ...plugin.meta,
      name,
      desc: "Accepts an email address and launches your mail client when clicked.",
    },
    default: { ...plugin.default, name },
  };
}

export function phone(): PhonePlugin {
  const plugin = createLinkPlugin("phone");
  const name = "Phone";
  return {
    ...plugin,
    meta: {
      ...plugin.meta,
      name,
      desc: "Accepts a phone number and prompts your device to call it when clicked.",
    },
    default: { ...plugin.default, name },
  };
}

export function url(): UrlPlugin {
  const plugin = createLinkPlugin("url");
  const name = "URL";
  return {
    ...plugin,
    meta: {
      ...plugin.meta,
      name,
      desc: "Accepts a link to a website and opens the link in a new tab when clicked.",
    },
    default: { ...plugin.default, name },
  };
}
