import type { Page } from "@notion-kit/schemas";
import type { TreeItemBase } from "@notion-kit/shadcn";

export type PageItems = Record<string, Page & TreeItemBase>;

export type Listener = () => void;
