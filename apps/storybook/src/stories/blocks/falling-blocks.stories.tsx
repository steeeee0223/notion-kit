import { RestrictToElement } from "@dnd-kit/dom/modifiers";
import {
  DragDropProvider,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { cn } from "@notion-kit/cn";
import {
  FallingBlocks,
  useFallingBlocks,
} from "@notion-kit/cool-blocks/falling-blocks";
import { TooltipPreset, TooltipProvider } from "@notion-kit/ui/primitives";

import { DEFAULT_LOGOS } from "./data";

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
        <FallingBlocks.Root className="relative h-105 w-100 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {DEFAULT_LOGOS.map((block) => (
            <FallingBlocks.Item
              key={block.name}
              className="flex size-16 flex-col items-center justify-center gap-1 rounded-lg shadow-lg select-none"
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
  const { ref } = useDroppable({
    id: "falling-blocks-root",
    type: "falling-blocks-root",
    accept: "falling-block",
  });

  const handleDragStart = (e: DragStartEvent) => {
    const { source } = e.operation;
    if (source) setDragStart(Number(source.id));
  };

  const handleDragMove = (e: DragMoveEvent) => {
    const { source, transform } = e.operation;
    if (source) setDragMove(Number(source.id), transform.x, transform.y);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { source, transform } = e.operation;
    if (source) setDragEnd(Number(source.id), transform.x, transform.y);
  };

  return (
    <DragDropProvider
      modifiers={[
        RestrictToElement.configure({
          element: (operation) =>
            operation.source?.element?.parentElement ?? null,
        }),
      ]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div ref={ref} className="absolute inset-0">
        {DEFAULT_LOGOS.map((block, index) => (
          <DraggableItem key={block.name} block={block} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

function DraggableItem({
  block,
  index,
}: {
  block: (typeof DEFAULT_LOGOS)[number];
  index: number;
}) {
  const { isDragging, ref } = useDraggable({
    id: index,
    type: "falling-block",
  });

  return (
    <FallingBlocks.Item
      physicsIndex={index}
      className={cn(
        "flex size-16 flex-col items-center justify-center gap-1 rounded-lg shadow-lg select-none",
        isDragging ? "z-50 cursor-grabbing" : "cursor-grab",
      )}
      style={{ background: block.bg }}
      ref={ref}
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
          className="relative h-105 w-100 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
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
