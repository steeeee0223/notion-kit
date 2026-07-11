import type { CellPlugin } from "@notion-kit/table-hook";

export type EmailPlugin = CellPlugin<"email", string, undefined>;
export type PhonePlugin = CellPlugin<"phone", string, undefined>;
export type UrlPlugin = CellPlugin<"url", string, undefined>;
