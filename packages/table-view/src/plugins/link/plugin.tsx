import { DefaultIcon } from "../../common";
import { NEVER } from "../../lib/utils";
import { LinkCell } from "./link-cell";
import type { EmailPlugin, PhonePlugin, UrlPlugin } from "./types";

export function email(): EmailPlugin {
  return {
    id: "email",
    meta: {
      name: "Email",
      icon: <DefaultIcon type="email" className="fill-menu-icon" />,
      desc: "Accepts an email address and launches your mail client when clicked.",
    },
    default: {
      name: "Email",
      icon: <DefaultIcon type="email" />,
      data: "",
      config: NEVER,
    },
    fromReadableValue: (value) => value,
    toReadableValue: (data) => data,
    toTextValue: (data) => data,
    renderCell: (props) => <LinkCell type="email" {...props} />,
    reducer: (v) => v,
  };
}

export function phone(): PhonePlugin {
  return {
    id: "phone",
    meta: {
      name: "Phone",
      icon: <DefaultIcon type="phone" className="fill-menu-icon" />,
      desc: "Accepts a phone number and prompts your device to call it when clicked.",
    },
    default: {
      name: "Phone",
      icon: <DefaultIcon type="phone" />,
      data: "",
      config: NEVER,
    },
    fromReadableValue: (value) => value,
    toReadableValue: (data) => data,
    toTextValue: (data) => data,
    renderCell: (props) => <LinkCell type="phone" {...props} />,
    reducer: (v) => v,
  };
}

export function url(): UrlPlugin {
  return {
    id: "url",
    meta: {
      name: "URL",
      icon: <DefaultIcon type="url" className="fill-menu-icon" />,
      desc: "Accepts a link to a website and opens the link in a new tab when clicked.",
    },
    default: {
      name: "URL",
      icon: <DefaultIcon type="url" />,
      data: "",
      config: NEVER,
    },
    fromReadableValue: (value) => value,
    toReadableValue: (data) => data,
    toTextValue: (data) => data,
    renderCell: (props) => <LinkCell type="url" {...props} />,
    reducer: (v) => v,
  };
}
