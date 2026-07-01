import { useId, useState } from "react";
import { move } from "@dnd-kit/helpers";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Button, Separator } from "@/primitives";

import {
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
} from "./kanban-column";
import { KanbanItem } from "./kanban-item";
import { KanbanProvider } from "./kanban-provider";
import { KanbanDnd } from "./types";

export function KanbanDemo() {
  const blockId = useId();
  const [items, setItems] = useState<Record<string, string[]>>({
    A: ["A0", "A1", "A2"],
    B: ["B0", "B1"],
    C: [],
  });
  const [columnOrder, setColumnOrder] = useState(() => Object.keys(items));

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="contain-layout">
        <div
          data-block-id={blockId}
          className="relative flex min-w-full grow py-2"
        >
          <KanbanProvider
            onDragOver={(event) => {
              const { source, target } = event.operation;

              if (source?.type === KanbanDnd.Column) return;

              setItems((items) => move(items, event));
            }}
            onDragEnd={(event) => {
              const { source, target } = event.operation;

              if (event.canceled || source?.type !== KanbanDnd.Column) return;

              setColumnOrder((columns) => move(columns, event));
            }}
          >
            {columnOrder.map((column, columnIndex) => (
              <KanbanColumn key={column} id={column} index={columnIndex}>
                <KanbanColumnHeader>
                  <div className="flex max-w-100 items-center overflow-hidden text-sm/6 font-medium whitespace-nowrap">
                    {column}
                  </div>
                </KanbanColumnHeader>
                <KanbanColumnContent>
                  {items[column]?.map((id, index) => (
                    <KanbanItem key={id} id={id} index={index} groupId={column}>
                      {/* Card actions */}
                      <div className="relative z-10">
                        <div
                          className={cn(
                            "pointer-events-auto absolute inset-e-0 z-20 flex h-6 rounded-sm border border-border text-xs whitespace-nowrap text-secondary shadow-sm",
                            "opacity-0 transition-opacity group-hover/card:opacity-100 has-aria-expanded:opacity-100",
                          )}
                        >
                          {/* Title Edit Popover */}
                          <Button
                            variant={null}
                            className="flex rounded-none px-1.5 py-1 text-secondary"
                            aria-label="Edit"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icon.PencilLine className="fill-current" />
                          </Button>

                          <Separator orientation="vertical" />
                          {/* Row action menu */}

                          <Button
                            variant={null}
                            className="flex rounded-none px-1.5 py-1 text-secondary"
                            aria-label="Actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icon.Dots className="size-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                      {/* Card title */}
                      <div className="relative flex w-auto items-center gap-1 px-1 pt-0.5 pb-1.5">
                        <div className="min-h-6 w-auto max-w-full grow text-sm/normal font-medium wrap-break-word whitespace-pre-wrap">
                          {id}
                        </div>
                      </div>
                    </KanbanItem>
                  ))}
                </KanbanColumnContent>
              </KanbanColumn>
            ))}
          </KanbanProvider>
        </div>
      </div>
    </div>
  );
}
