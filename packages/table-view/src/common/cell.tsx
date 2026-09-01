import {
  createContext,
  use,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  flexRender,
  functionalUpdate,
  type Updater,
} from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useRect } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  wrappedClassName,
  type TableInstance as _TableInstance,
  type CellInstance,
  type Row,
} from "@notion-kit/table-hook";
import {
  toDateString,
  type CellEditorProps,
  type CellValueProps,
  type DateConfig,
  type DateData,
  type TitleConfig,
} from "@notion-kit/table-hook/plugins";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { CellTrigger, CellTriggerScope } from "@/common/cell-trigger";
import { CopyButton } from "@/common/copy-button";
import { SelectOptionTooltipScope } from "@/plugins/select/select-cell";
import { TitleCompactSlot, TitleTableSlot } from "@/plugins/title/title-cell";
import type { CellPresentation, CellSurface } from "@/plugins/utils";

interface CellContextValue {
  cell: CellInstance;
  table: _TableInstance;
  surface: CellSurface;
  presentation: CellPresentation;
  wrapped?: boolean;
}

const CellContext = createContext<CellContextValue | null>(null);

interface CellRootProps extends CellContextValue {
  children: ReactNode;
}

function Root({ children, ...value }: CellRootProps) {
  return <CellContext value={value}>{children}</CellContext>;
}

function useCellContext() {
  const context = use(CellContext);
  if (!context) throw new Error("Cell compound components require Cell.Root");
  return context;
}

function TableFrame({ children }: { children: ReactNode }) {
  const { cell, presentation } = useCellContext();
  const { column, row } = cell;
  const width = column.getWidth();

  return (
    <div
      id="notion-table-view-cell"
      data-row-index={`${row.depth}:${row.index}`}
      data-col-index={column.getIndex()}
      data-property-id={column.id}
      className={presentation.frameClassName}
      style={{ width }}
    >
      {row.subRows.length > 0 && (
        <div className="mt-1.5 flex">
          <Button
            tabIndex={0}
            variant="hint"
            className="size-6"
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Close" : "Open"}
            onPointerDown={row.getToggleExpandedHandler()}
          >
            <Icon.ArrowCaretFillSmall
              className="size-[0.8em] fill-menu-icon transition-[rotate]"
              side={row.getIsExpanded() ? "down" : "right"}
            />
          </Button>
        </div>
      )}
      <div className="flex h-full overflow-x-clip" style={{ width }}>
        {children}
      </div>
    </div>
  );
}

function CompactFrame({
  children,
  className,
  ref,
  ...props
}: ComponentProps<"div">) {
  const { cell, presentation, surface } = useCellContext();
  const isListTitle =
    surface === "list" && cell.column.getPlugin().id === "title";

  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        "flex empty:hidden",
        isListTitle ? "min-w-30 flex-[1_1_auto]" : "flex-none",
        !isListTitle && presentation.compactWidthClassName,
        surface === "board" && "w-fit",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Tooltip({ children }: { children: ReactElement }) {
  const { cell, surface, table } = useCellContext();
  const info = cell.column.getInfo();
  const plugin = cell.column.getPlugin();

  return (
    <TooltipPreset
      // Both conditions independently disable the tooltip; `??` is not equivalent.
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      disabled={table.getTableGlobalState().locked || plugin.id === "title"}
      side={surface === "board" ? "left" : "top"}
      description={
        info.description ? (
          <>
            <TooltipDescription text={info.name} />
            <TooltipDescription type="secondary" text={info.description} />
          </>
        ) : (
          info.name
        )
      }
    >
      {children}
    </TooltipPreset>
  );
}

function Content() {
  const { cell, table, surface, presentation, wrapped } = useCellContext();
  const { column, row } = cell;
  const data = row.original.properties[column.id];
  const info = column.getInfo();
  const plugin = column.getPlugin();
  const { locked } = table.getTableGlobalState();
  const [open, setOpen] = useState(false);
  const { ref, rect } = useRect<HTMLElement>();

  if (!data) return null;
  const cellData: unknown = data.value;
  const cellConfig: unknown = info.config;
  const valueProps: CellValueProps<unknown, unknown> = {
    propId: column.id,
    row: row.original,
    data: cellData,
    config: cellConfig,
    wrapped,
    disabled: locked,
  };
  const value = flexRender(plugin.renderCellValue, valueProps);
  const editorProps: CellEditorProps<unknown, unknown> = {
    propId: column.id,
    data: cellData,
    config: cellConfig,
    wrapped,
    disabled: locked,
    scope: { kind: "cell", row: row.original },
    onChange: (updater: Updater<unknown>) => {
      if (table.getTableGlobalState().locked) return;
      column.updateCell(row.id, updater, row.parentId);
    },
    onConfigChange: (updater: Updater<unknown>) => {
      if (table.getTableGlobalState().locked) return;
      column.updateConfig(updater);
    },
  };

  if (plugin.id === "title") {
    return renderTitle({
      cellData,
      cellConfig,
      editorProps,
      presentation,
      row: row.original,
      surface,
      value,
      wrapped,
    });
  }

  if (plugin.id === "checkbox") {
    const result = plugin.renderCellEditor?.(editorProps);
    return (
      <CellTrigger
        className={cn(
          presentation.triggerClassName,
          surface === "list" && "w-full",
        )}
        disabled={locked}
        onClick={result ? () => editorProps.onChange(!cellData) : undefined}
      >
        {result?.content ?? value}
      </CellTrigger>
    );
  }

  const result = plugin.renderCellEditor?.({
    ...editorProps,
    onChange: (updater) => {
      editorProps.onChange(functionalUpdate(updater, editorProps.data));
      if (result?.closeOnChange !== false) setOpen(false);
    },
    onCancel: () => setOpen(false),
  });

  if (result?.presentation === "inline") return result.content;
  if (isCompactEmpty(surface, plugin.id, cellData)) return null;

  const isEmpty = surface === "row-view" && isRowViewEmpty(plugin.id, cellData);
  const content = isEmpty ? (
    <RowViewEmptyContent presentation={presentation} wrapped={wrapped} />
  ) : isSelectPlugin(plugin.id) ? (
    <SelectOptionTooltipScope enabled={surface === "table"}>
      {value}
    </SelectOptionTooltipScope>
  ) : (
    value
  );
  const showCopy = shouldRenderCopy(surface, plugin.id);
  const trigger = (
    <CellTrigger
      className={cn(
        presentation.triggerClassName,
        presentation.copyGroupClassName,
        surface === "list" && "w-full",
      )}
      disabled={locked}
      onClick={result ? () => setOpen(true) : undefined}
    >
      {showCopy && (
        <CopyButton
          className={presentation.copyHoverClassName}
          value={getCopyValue({
            cellConfig,
            cellData,
            pluginId: plugin.id,
            row: row.original,
            toTextValue: plugin.toTextValue,
          })}
        />
      )}
      {content}
    </CellTrigger>
  );

  if (!result) return trigger;

  const { popover } = result;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger ref={ref} nativeButton={false} render={trigger} />
      <PopoverContent
        align={popover?.align}
        alignOffset={popover?.alignOffset}
        side={popover?.side}
        sideOffset={
          typeof popover?.sideOffset === "function"
            ? popover.sideOffset(rect)
            : popover?.sideOffset
        }
        className={popover?.className}
      >
        {result.content}
      </PopoverContent>
    </Popover>
  );
}

interface RenderTitleOptions {
  cellData: unknown;
  cellConfig: unknown;
  editorProps: CellEditorProps<unknown, unknown>;
  presentation: CellPresentation;
  row: Row;
  surface: CellSurface;
  value: ReactNode;
  wrapped?: boolean;
}

function renderTitle({
  cellData,
  cellConfig,
  editorProps,
  presentation,
  row,
  surface,
  value,
  wrapped,
}: RenderTitleOptions) {
  const titleEditorProps = editorProps as CellEditorProps<string, TitleConfig>;
  const icon = (cellConfig as TitleConfig).showIcon ? row.icon : undefined;

  switch (surface) {
    case "table":
      return (
        <CellTriggerScope
          ariaLabel={String(cellData)}
          className={presentation.triggerClassName}
        >
          <TitleTableSlot
            value={value}
            editorProps={titleEditorProps}
            row={row}
            icon={icon}
          />
        </CellTriggerScope>
      );
    case "list":
      return (
        <CellTriggerScope
          className={presentation.triggerClassName}
          stopPropagation={false}
        >
          <TitleCompactSlot
            value={value}
            editorProps={titleEditorProps}
            row={row}
            icon={icon}
          />
        </CellTriggerScope>
      );
    case "timeline":
      return (
        <>
          {icon && <IconBlock icon={icon} className="contents" />}
          <span className={cn(wrapped ? wrappedClassName(true) : "truncate")}>
            {cellData ? value : "New page"}
          </span>
        </>
      );
    default:
      return null;
  }
}

interface RowViewEmptyContentProps {
  presentation: CellPresentation;
  wrapped?: boolean;
}

function RowViewEmptyContent({
  presentation,
  wrapped,
}: RowViewEmptyContentProps) {
  const empty = <span className="text-muted">Empty</span>;

  switch (presentation.type) {
    case "number":
      return (
        <div
          className={cn(
            "flex justify-end gap-x-2 gap-y-1.5",
            wrapped ? "flex-wrap" : "flex-nowrap",
          )}
        >
          {empty}
        </div>
      );
    case "select":
      return (
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex flex-nowrap gap-x-2 gap-y-1.5",
              wrapped && "flex-wrap",
            )}
          >
            {empty}
          </div>
        </div>
      );
    default:
      return (
        <div className={cn("leading-normal", wrappedClassName(wrapped))}>
          {empty}
        </div>
      );
  }
}

function isCompactEmpty(surface: CellSurface, pluginId: string, data: unknown) {
  if (surface !== "list" && surface !== "board") return false;

  switch (pluginId) {
    case "text":
    case "email":
    case "phone":
    case "url":
      return !data;
    case "number":
    case "select":
      return data === null;
    case "multi-select":
      return Array.isArray(data) && data.length === 0;
    case "date":
      return (data as DateData).start === undefined;
    default:
      return false;
  }
}

function isRowViewEmpty(pluginId: string, data: unknown) {
  switch (pluginId) {
    case "text":
    case "email":
    case "phone":
    case "url":
      return !data;
    case "number":
      return data === null || !data || isNaN(Number(data));
    case "select":
      return data === null;
    case "multi-select":
      return Array.isArray(data) && data.length === 0;
    case "date":
      return (data as DateData).start === undefined;
    default:
      return false;
  }
}

function isSelectPlugin(pluginId: string) {
  return pluginId === "select" || pluginId === "multi-select";
}

function shouldRenderCopy(surface: CellSurface, pluginId: string) {
  switch (pluginId) {
    case "text":
    case "email":
    case "phone":
    case "url":
    case "date":
      return surface === "table" || surface === "row-view";
    case "number":
    case "created-time":
    case "last-edited-time":
      return surface === "table";
    default:
      return false;
  }
}

interface GetCopyValueOptions {
  cellConfig: unknown;
  cellData: unknown;
  pluginId: string;
  row: Row;
  toTextValue: (data: unknown, row: Row) => string;
}

function getCopyValue({
  cellConfig,
  cellData,
  pluginId,
  row,
  toTextValue,
}: GetCopyValueOptions) {
  const config = cellConfig as DateConfig;
  switch (pluginId) {
    case "date":
      return toDateString(cellData as DateData, config);
    case "created-time":
      return toDateString({ start: row.createdAt, includeTime: true }, config);
    case "last-edited-time":
      return toDateString(
        { start: row.lastEditedAt, includeTime: true },
        config,
      );
    default:
      return toTextValue(cellData, row);
  }
}

export const Cell = {
  Root,
  TableFrame,
  CompactFrame,
  Tooltip,
  Content,
  Trigger: CellTrigger,
};
