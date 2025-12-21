import type { RowViewType } from "./menu";

export const ROW_VIEW_OPTIONS: Record<
  RowViewType,
  {
    label: string;
    tooltip: string;
    desc: string;
  }
> = {
  side: {
    label: "Side peek",
    tooltip: "Open in side peek",
    desc: "Open pages on the side. Keeps the view behind interactive.",
  },
  center: {
    label: "Center peek",
    tooltip: "Open in center peek",
    desc: "Open pages in a focused, centered modal.",
  },
  full: {
    label: "Full Page",
    tooltip: "Open in full page",
    desc: "Open pages in full page.",
  },
};
