import type { CellPlugin } from "../types";

export type EmailPlugin = CellPlugin<"email", string, undefined>;
export type PhonePlugin = CellPlugin<"phone", string, undefined>;
export type UrlPlugin = CellPlugin<"url", string, undefined>;
