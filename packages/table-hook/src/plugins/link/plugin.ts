import type { CellPlugin, PluginFactoryConfig } from "@/plugins";
import {
  compareStrings,
  createCompareFn,
  genericCounting,
  textMethodCapabilities,
} from "@/plugins/utils";

export type EmailPlugin = CellPlugin<"email", string, undefined>;
export type PhonePlugin = CellPlugin<"phone", string, undefined>;
export type UrlPlugin = CellPlugin<"url", string, undefined>;
export type EmailPluginConfig = PluginFactoryConfig<EmailPlugin>;
export type PhonePluginConfig = PluginFactoryConfig<PhonePlugin>;
export type UrlPluginConfig = PluginFactoryConfig<UrlPlugin>;

function createLinkPlugin<T extends "email" | "phone" | "url">(
  type: T,
  config: PluginFactoryConfig<CellPlugin<T, string, undefined>>,
): CellPlugin<T, string, undefined> {
  return {
    id: type,
    meta: { name: "", icon: config.icon, desc: "" },
    default: {
      name: "",
      icon: config.defaultIcon ?? config.icon,
      data: "",
      config: undefined,
    },
    compare: createCompareFn(compareStrings),
    ...textMethodCapabilities<string>(),
    counting: genericCounting,
    fromValue: (value) => (typeof value === "string" ? value : ""),
    toValue: (data) => data,
    toTextValue: (data) => data,
    renderCellValue: config.renderCellValue,
    renderCellEditor: config.renderCellEditor,
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}

export function email(config: EmailPluginConfig): EmailPlugin {
  const plugin = createLinkPlugin("email", config);
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

export function phone(config: PhonePluginConfig): PhonePlugin {
  const plugin = createLinkPlugin("phone", config);
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

export function url(config: UrlPluginConfig): UrlPlugin {
  const plugin = createLinkPlugin("url", config);
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
