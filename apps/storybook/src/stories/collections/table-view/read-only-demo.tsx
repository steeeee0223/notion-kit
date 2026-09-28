import { cn } from "@notion-kit/cn";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";
import type {
  CellProps,
  DeepPartial,
  RowInstance,
  TableUiPlugin,
  TableViewMessages,
} from "@notion-kit/table-view";

/**
 * A consumer-defined "status" property. It only implements the two required
 * UI adapter fields (`renderCell`, `renderGroupingValue`) plus the optional
 * `renderReadOnlyValue` for edit-log history — there is no bulk editor, no
 * config menu, and `renderCell` never calls `cell.update`. This demonstrates
 * that a fully read-only custom cell plugin needs no special registry
 * support.
 */
export type CaptureStatus = "queued" | "processing" | "captured" | "failed";
export type StatusPlugin = CellPlugin<"status", CaptureStatus, undefined>;

const STATUS_META: Record<CaptureStatus, { label: string; className: string }> =
  {
    queued: { label: "Queued", className: "bg-default/10 text-secondary" },
    processing: { label: "Processing", className: "bg-blue/15 text-blue" },
    captured: { label: "Captured", className: "bg-green/15 text-green" },
    failed: { label: "Failed", className: "bg-red/15 text-red" },
  };

export const statusPlugin: StatusPlugin = {
  id: "status",
  default: { data: "queued", config: undefined },
  fromValue: (value) =>
    value === "processing" || value === "captured" || value === "failed"
      ? value
      : "queued",
  toValue: (data) => data,
  isEmpty: () => false,
  toTextValue: (data) => STATUS_META[data].label,
};

function StatusBadge({ cell }: CellProps) {
  const data = cell.getData<StatusPlugin>();
  const meta = STATUS_META[data];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

export const statusPluginUi: TableUiPlugin<StatusPlugin> = {
  id: "status",
  meta: {
    name: "Status",
    desc: "A read-only capture status badge",
    icon: null,
  },
  default: { name: "Status", icon: null },
  renderCell: (props) => <StatusBadge {...props} />,
  renderReadOnlyValue: ({ value }) => {
    const status = value as CaptureStatus | undefined;
    return <>{status ? STATUS_META[status].label : "—"}</>;
  },
  renderGroupingValue: ({ value }) => <>{String(value)}</>,
};

const now = Date.now();

export function createCaptureRunFixture() {
  const properties = [
    { id: "supplier", name: "Supplier", type: "title" as const },
    {
      id: "mailbox",
      name: "Mailbox",
      type: "text" as const,
      config: undefined,
    },
    {
      id: "status",
      name: "Status",
      type: "status" as const,
      config: undefined,
    },
  ];

  const data = [
    {
      id: "capture-1",
      createdAt: now,
      lastEditedAt: now,
      properties: {
        supplier: { id: "capture-1-supplier", value: "Acme Utilities" },
        mailbox: { id: "capture-1-mailbox", value: "billing@acme.test" },
        status: { id: "capture-1-status", value: "captured" as CaptureStatus },
      },
    },
    {
      id: "capture-2",
      createdAt: now - 3_600_000,
      lastEditedAt: now - 3_600_000,
      properties: {
        supplier: { id: "capture-2-supplier", value: "Northwind Traders" },
        mailbox: { id: "capture-2-mailbox", value: "invoices@nw.test" },
        status: {
          id: "capture-2-status",
          value: "processing" as CaptureStatus,
        },
      },
    },
    {
      id: "capture-3",
      createdAt: now - 7_200_000,
      lastEditedAt: now - 7_200_000,
      properties: {
        supplier: { id: "capture-3-supplier", value: "Contoso Freight" },
        mailbox: { id: "capture-3-mailbox", value: "ap@contoso.test" },
        status: { id: "capture-3-status", value: "failed" as CaptureStatus },
      },
    },
  ];

  return { properties, data };
}

/** A Dutch translation of the table-view message catalog used by this demo. */
export const nlMessages: DeepPartial<TableViewMessages> = {
  toolbar: {
    filter: "Filter",
    sort: "Sorteren",
    search: "Zoeken",
    searchInputLabel: "Tabel doorzoeken",
    searchPlaceholder: "Zoeken",
    settings: "Instellingen",
  },
  rowView: {
    close: "Sluiten",
    modes: {
      side: {
        label: "Zijkant",
        tooltip: "Openen in zijkant",
        desc: "Open pagina's aan de zijkant.",
      },
      center: {
        label: "Gecentreerd",
        tooltip: "Openen in het midden",
        desc: "Open pagina's in een gecentreerd venster.",
      },
      full: {
        label: "Volledige pagina",
        tooltip: "Openen als volledige pagina",
        desc: "Open pagina's op een volledige pagina.",
      },
    },
    open: "Openen",
    previousRow: "Vorige rij",
    nextRow: "Volgende rij",
  },
};

export function CaptureRunRowDetails({ row }: { row: RowInstance }) {
  const status = row.original.properties.status?.value as
    | CaptureStatus
    | undefined;
  return (
    <div className="mt-4 rounded-md border border-border p-3 text-sm text-secondary">
      Extra detail rendered by <code>renderRowView</code> for row{" "}
      <strong>{row.id}</strong>. Current status:{" "}
      {status ? STATUS_META[status].label : "Onbekend"}.
    </div>
  );
}
