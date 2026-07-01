import { DragDropProvider } from "@dnd-kit/react";

import type { InferProps } from "./types";

type KanbanProviderProps = InferProps<typeof DragDropProvider>;

export function KanbanProvider({
  children,
  onDragOver,
  ...props
}: KanbanProviderProps) {
  return (
    <DragDropProvider onDragOver={onDragOver} {...props}>
      <div data-slot="kanban" className="flex items-start gap-3">
        {children}
      </div>
    </DragDropProvider>
  );
}
