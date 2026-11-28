import type { ReactNode } from "react";

import { cn } from "@notion-kit/cn";
import { ComboboxChips, ComboboxChipsInput } from "@notion-kit/ui/primitives";

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
}: {
  cell: Pick<
    CellRendererProps<unknown, unknown>,
    "disabled" | "surface" | "wrapped"
  >;
  text: string;
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
      surface={cell.surface}
      triggerClassName={getCellTriggerClass({
        kind: "text",
        surface: cell.surface,
        wrapped: cell.wrapped,
      })}
      value={<span className="truncate">{text}</span>}
    />
  );
}

export function PropertyEditorCell({
  cell,
  isEmpty,
  value,
  renderEditor,
}: {
  cell: Pick<
    CellRendererProps<unknown, unknown>,
    "disabled" | "surface" | "wrapped"
  >;
  isEmpty: boolean;
  value: ReactNode;
  renderEditor?: (close: () => void) => ReactNode;
}) {
  const { disabled, surface, wrapped } = cell;
  return (
    <CellRenderer
      compactClassName={getCompactWidthClass("select")}
      disabled={disabled}
      emptyContent={
        surface === "row-view" && isEmpty ? (
          <PropertyCellValues wrapped={wrapped} className="text-muted">
            Empty
          </PropertyCellValues>
        ) : undefined
      }
      hideWhenEmpty={surface === "list" || surface === "board"}
      isEmpty={isEmpty}
      popover={{
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      }}
      renderEditor={renderEditor}
      surface={surface}
      triggerClassName={getCellTriggerClass({
        kind: "select",
        surface,
        wrapped,
      })}
      value={value}
    />
  );
}

export function PropertyCellValues({
  children,
  wrapped,
  className,
}: {
  children: ReactNode;
  wrapped?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={cn(
          "flex min-w-0 flex-nowrap gap-x-2 gap-y-1.5",
          wrapped && "flex-wrap",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PropertySearch({
  children,
  label,
  placeholder,
  onClose,
}: {
  children?: ReactNode;
  label: string;
  placeholder: string;
  onClose?: () => void;
}) {
  return (
    <ComboboxChips variant="inline" hideClearButton className="z-10 max-h-60">
      {children}
      <ComboboxChipsInput
        aria-label={label}
        placeholder={placeholder}
        onKeyDownCapture={(event) => {
          // The inline combobox stays open. Escape dismisses the cell editor.
          if (event.key !== "Escape" || !onClose) return;
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }}
      />
    </ComboboxChips>
  );
}
