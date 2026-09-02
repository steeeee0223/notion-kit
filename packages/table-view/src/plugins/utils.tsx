import { cva } from "@notion-kit/cn";
import {
  getDefaultGroupingValue,
  type GroupingValueProps,
} from "@notion-kit/table-hook/plugins";

export type CellSurface = "table" | "list" | "board" | "row-view" | "timeline";

export type CellStyleKind =
  | "text"
  | "number"
  | "select"
  | "link"
  | "date"
  | "checkbox"
  | "neutral";

const triggerVariants = cva("relative px-2 aria-disabled:pointer-events-none", {
  variants: {
    surface: {
      table: "block min-h-9 w-full overflow-clip py-[7.5px] text-sm/normal",
      list: "min-h-[30px] flex-none overflow-hidden rounded-md",
      board: "min-h-7 w-fit flex-none overflow-hidden rounded-md px-1",
      "row-view": "min-h-[34px] w-full overflow-hidden rounded-sm p-1.5",
      timeline: "",
    },
    wrapped: {
      true: "whitespace-normal",
    },
    type: {
      text: "",
      number: "",
      select: "",
      link: "",
      date: "",
      checkbox: "",
      neutral: "",
    },
  },
  compoundVariants: [
    {
      surface: "table",
      type: "number",
      className: "h-9",
    },
    {
      surface: "table",
      type: "checkbox",
      className: "py-2.5",
    },
  ],
});

const compactWidthVariants = cva("", {
  variants: {
    type: {
      checkbox: "min-w-fit",
      date: "max-w-[max(150px,16%)] min-w-25",
      number: "max-w-[max(150px,16%)] min-w-25",
      text: "max-w-[max(200px,16%)] min-w-5",
      select: "max-w-[max(200px,16%)] min-w-5",
      link: "max-w-[max(150px,16%)] min-w-5",
      neutral: "",
    },
  },
});

export function getCellTriggerClass({
  kind,
  surface,
  wrapped,
}: {
  kind: CellStyleKind;
  surface: CellSurface;
  wrapped?: boolean;
}) {
  return triggerVariants({ surface, wrapped, type: kind });
}

export function getCompactWidthClass(kind: CellStyleKind) {
  return compactWidthVariants({ type: kind });
}

export function getCopyClasses(kind: CellStyleKind) {
  switch (kind) {
    case "text":
      return {
        copyGroupClassName: "group/text-cell",
        copyHoverClassName: "hidden group-hover/text-cell:flex",
      };
    case "number":
      return {
        copyGroupClassName: "group/number-cell",
        copyHoverClassName: "hidden justify-start group-hover/number-cell:flex",
      };
    case "link":
      return {
        copyGroupClassName: "group/link-cell",
        copyHoverClassName: "hidden group-hover/link-cell:flex",
      };
    case "date":
      return {
        copyGroupClassName: "group/date-cell",
        copyHoverClassName: "hidden group-hover/date-cell:flex",
      };
    default:
      return {};
  }
}

export function DefaultGroupingValue({ value }: GroupingValueProps) {
  return <span className="truncate">{getDefaultGroupingValue(value)}</span>;
}
