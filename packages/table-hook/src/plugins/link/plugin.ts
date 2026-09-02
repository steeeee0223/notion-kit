import type { CellPlugin } from "@/plugins";
import {
  compareStrings,
  createCompareFn,
  genericCounting,
  textFilteringCapabilities,
  textMethodCapabilities,
} from "@/plugins/utils";

export type EmailPlugin = CellPlugin<"email", string, undefined>;
export type PhonePlugin = CellPlugin<"phone", string, undefined>;
export type UrlPlugin = CellPlugin<"url", string, undefined>;
function createLinkPlugin<T extends "email" | "phone" | "url">(
  type: T,
): CellPlugin<T, string, undefined> {
  const isEmpty = (data: string) => data.trim() === "";
  return {
    id: type,
    default: {
      data: "",
      config: undefined,
    },
    compare: createCompareFn(compareStrings),
    ...textMethodCapabilities<string>(),
    ...textFilteringCapabilities(isEmpty),
    counting: genericCounting(isEmpty),
    fromValue: (value) => (typeof value === "string" ? value : ""),
    toValue: (data) => data,
    isEmpty,
    toTextValue: (data) => data,
  };
}

export function email(): EmailPlugin {
  return createLinkPlugin("email");
}

export function phone(): PhonePlugin {
  return createLinkPlugin("phone");
}

export function url(): UrlPlugin {
  return createLinkPlugin("url");
}
