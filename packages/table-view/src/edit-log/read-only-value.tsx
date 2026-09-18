import { Component, type ReactNode } from "react";

import { useTableViewCtx } from "@/table-contexts";

import type { RowEditLog } from "./types";

export function ReadOnlyValue({ record }: { record: RowEditLog }) {
  const { plugins } = useTableViewCtx();
  const Renderer = plugins.ui.find(
    (plugin) => plugin.id === record.property.type,
  )?.renderReadOnlyValue;
  if (!Renderer) return record.textValue;
  return (
    <ValueBoundary key={record.id} fallback={record.textValue}>
      <Renderer
        value={record.value}
        config={record.property.config}
        property={record.property}
        textValue={record.textValue}
      />
    </ValueBoundary>
  );
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
