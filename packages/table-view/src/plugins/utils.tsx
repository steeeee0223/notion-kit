import { cva } from "@notion-kit/cn";
import {
  getDefaultGroupingValue,
  type GroupingValueProps,
} from "@notion-kit/table-hook/plugins";

export type CellSurface = "table" | "list" | "board" | "row-view" | "timeline";

export type CellPresentationType =
  | "text"
  | "number"
  | "select"
  | "link"
  | "date"
  | "checkbox"
  | "neutral";

export interface CellPresentation {
  type: CellPresentationType;
  frameClassName: string;
  triggerClassName: string;
  copyGroupClassName?: string;
  copyHoverClassName?: string;
  compactWidthClassName?: string;
}

const PRESENTATION_BY_PLUGIN_ID: Record<string, CellPresentationType> = {
  title: "text",
  text: "text",
  number: "number",
  select: "select",
  "multi-select": "select",
  email: "link",
  phone: "link",
  url: "link",
  date: "date",
  "created-time": "date",
  "last-edited-time": "date",
  checkbox: "checkbox",
};

const frameVariants = cva("", {
  variants: {
    surface: {
      table: "relative flex h-full border-r border-r-border-cell",
      list: "",
      board: "",
      "row-view": "flex h-full min-w-0 flex-[1_1_auto] flex-wrap",
      timeline: "",
    },
  },
});

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

interface GetCellPresentationOptions {
  pluginId: string;
  surface: CellSurface;
  wrapped?: boolean;
}

export function getCellPresentation({
  pluginId,
  surface,
  wrapped,
}: GetCellPresentationOptions): CellPresentation {
  const type = PRESENTATION_BY_PLUGIN_ID[pluginId] ?? "neutral";

  return {
    type,
    frameClassName: frameVariants({ surface }),
    triggerClassName: triggerVariants({ surface, wrapped, type }),
    ...(surface === "list"
      ? { compactWidthClassName: compactWidthVariants({ type }) }
      : {}),
    ...getCopyClasses(type),
  };
}

function getCopyClasses(
  type: CellPresentationType,
): Pick<CellPresentation, "copyGroupClassName" | "copyHoverClassName"> {
  switch (type) {
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
