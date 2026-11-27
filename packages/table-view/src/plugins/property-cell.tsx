import type { ReactNode } from "react";

import { CellRenderer, DefaultIcon } from "@/common";

import type { CellRendererProps } from "./renderers";
import {
  getCellTriggerClass,
  getCompactWidthClass,
  getCopyClasses,
} from "./utils";

export function propertyMetadata(type: string, name: string, desc: string) {
  return {
    meta: {
      name,
      desc,
      icon: <DefaultIcon type={type} className="fill-menu-icon" />,
    },
    default: { name, icon: <DefaultIcon type={type} /> },
  };
}

export function PropertyCell({
  cell,
  text,
  children,
  renderEditor,
}: {
  cell: Pick<
    CellRendererProps<unknown, unknown>,
    "disabled" | "surface" | "wrapped"
  >;
  text: string;
  children?: ReactNode;
  renderEditor?: (close: () => void) => ReactNode;
}) {
  const isEmpty = text.trim().length === 0;
  const copy = getCopyClasses("text");
  const compact = cell.surface === "list" || cell.surface === "board";
  return (
    <CellRenderer
      compactClassName={getCompactWidthClass("text")}
      copyButtonClassName={copy.copyHoverClassName}
      copyClassName={copy.copyGroupClassName}
      copyValue={!compact && !isEmpty ? text : undefined}
      disabled={cell.disabled}
      emptyContent={
        cell.surface === "row-view" && isEmpty ? (
          <span className="text-muted">Empty</span>
        ) : undefined
      }
      hideWhenEmpty={compact}
      isEmpty={isEmpty}
      popover={{ align: "start", side: "bottom", className: "w-72 p-2" }}
      renderEditor={renderEditor}
      surface={cell.surface}
      triggerClassName={getCellTriggerClass({
        kind: "text",
        surface: cell.surface,
        wrapped: cell.wrapped,
      })}
      value={children ?? <span className="truncate">{text}</span>}
    />
  );
}
