import { Component, type ReactNode } from "react";

import type { ReadOnlyValueProps, TableUiPlugin } from "@/plugins/registry";
import { useTableViewCtx } from "@/table-contexts";

import type { RowEditLog } from "./types";

export function ReadOnlyValue({ record }: { record: RowEditLog }) {
  const { plugins } = useTableViewCtx();
  const renderer = plugins.ui.find(
    (plugin) => plugin.id === record.property.type,
  )?.renderReadOnlyValue;
  const fallback = (
    <span className="wrap-anywhere whitespace-pre-wrap">
      {record.textValue}
    </span>
  );

  if (!renderer) return fallback;
  return (
    <ValueBoundary key={record.id} fallback={fallback}>
      <SnapshotValue
        renderer={renderer}
        value={record.value}
        config={record.property.config}
        property={record.property}
        textValue={record.textValue}
      />
    </ValueBoundary>
  );
}

function SnapshotValue({
  renderer,
  ...props
}: ReadOnlyValueProps & {
  renderer: NonNullable<TableUiPlugin["renderReadOnlyValue"]>;
}) {
  return renderer(props);
}

class ValueBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
