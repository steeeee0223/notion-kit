import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { cn } from "@notion-kit/cn";
import { TooltipPreset, TooltipProvider } from "@notion-kit/ui/primitives";

import { DEFAULT_LOGOS } from "./data";
import { FallingBlocks, useFallingBlocks } from "./falling-blocks";

const meta = {
  title: "interesting/Falling Blocks",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    return (
      <TooltipProvider>
        <FallingBlocks.Root className="relative h-[420px] w-100 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {DEFAULT_LOGOS.map((block) => (
            <FallingBlocks.Item
              key={block.name}
              className="flex flex-col items-center justify-center gap-1 rounded-lg shadow-lg select-none"
              style={{ background: block.bg }}
            >
              <TooltipPreset description={block.name}>
                <div
                  className="size-[26px] shrink-0"
                  style={{ color: block.color }}
                >
                  {block.svg}
                </div>
              </TooltipPreset>
            </FallingBlocks.Item>
          ))}

          <FallingBlocks.PlayButton className="absolute right-4 bottom-4 z-10">
            Replay
          </FallingBlocks.PlayButton>
        </FallingBlocks.Root>
      </TooltipProvider>
    );
  },
};

// Internal wrapper for the Draggable story to use useFallingBlocks hook
function DraggableStage() {
  const { setDragStart, setDragMove, setDragEnd } = useFallingBlocks();
  const { setNodeRef } = useDroppable({ id: "falling-blocks-root" });

  const handleDragStart = (e: DragStartEvent) => {
    setDragStart(e.active.id as number);
  };

  const handleDragMove = (e: DragMoveEvent) => {
    setDragMove(e.active.id as number, e.delta.x, e.delta.y);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setDragEnd(e.active.id as number, e.delta.x, e.delta.y);
  };

  return (
    <DndContext
      modifiers={[restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragEnd}
    >
      <div ref={setNodeRef} className="absolute inset-0">
        {DEFAULT_LOGOS.map((block, index) => (
          <DraggableItem key={block.name} block={block} index={index} />
        ))}
      </div>
    </DndContext>
  );
}

function DraggableItem({
  block,
  index,
}: {
  block: (typeof DEFAULT_LOGOS)[0];
  index: number;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: index,
  });

  return (
    <FallingBlocks.Item
      physicsIndex={index}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-lg shadow-lg select-none",
        isDragging ? "z-50 cursor-grabbing" : "cursor-grab",
      )}
      style={{ background: block.bg }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <TooltipPreset description={block.name}>
        <div className="size-[26px] shrink-0" style={{ color: block.color }}>
          {block.svg}
        </div>
      </TooltipPreset>
    </FallingBlocks.Item>
  );
}

export const Draggable: Story = {
  render: () => {
    return (
      <TooltipProvider>
        <FallingBlocks.Root
          count={DEFAULT_LOGOS.length}
          className="relative h-[420px] w-100 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          <DraggableStage />

          <FallingBlocks.PlayButton className="absolute right-4 bottom-4 z-10">
            Replay
          </FallingBlocks.PlayButton>
        </FallingBlocks.Root>
      </TooltipProvider>
    );
  },
};
