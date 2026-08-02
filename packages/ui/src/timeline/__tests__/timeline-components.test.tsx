import React from "react";
import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GanttCreateMarkerTrigger, GanttMarker } from "../gantt";
import { TimelineColumn, TimelineColumns } from "../timeline-columns";
import {
  TimelineContent,
  TimelineList,
  TimelineListGroup,
} from "../timeline-content";
import { TimelineAddFeatureHelper } from "../timeline-feature";
import { TimelineRangeHeader } from "../timeline-range-header";
import { TimelineItem } from "../timeline-row/timeline-item";
import { TimelineItemResizer } from "../timeline-row/timeline-item-resizer";
import { TimelineJumpToItem } from "../timeline-row/timeline-jump-to-item";
import { TimelineRow } from "../timeline-row/timeline-row";
import { TimelineJumpTo } from "../tools/timeline-jump-to";
import { TimelineRangeSelect } from "../tools/timeline-range-select";
import {
  TimelineSidebar,
  TimelineSidebarBody,
  TimelineSidebarClose,
  TimelineSidebarHeader,
  TimelineSidebarTrigger,
} from "../tools/timeline-sidebar";
import { TimelineToday } from "../tools/timeline-today";
import {
  TimelineHeaderToolbar,
  TimelineToolbar,
} from "../tools/timeline-toolbar";
import type { TimelineContextProps, TimelineRange } from "../types";
import { useVisibleRange } from "../use-visible-range";
import { createTimelineData } from "../utils";

const mocks = vi.hoisted(() => ({
  context: {} as TimelineContextProps,
  dragging: false,
  scrollX: 0,
  sidebarWidth: 0,
  containerWidth: 500,
  mouse: { x: 0, y: 0 },
  mouseElement: null as HTMLDivElement | null,
  windowScroll: { x: 0, y: 0 },
  draggable: false,
  setDragging: vi.fn(),
  pointerSensor: {
    configure: (value: unknown) => ({ configured: value }),
  },
}));

vi.mock("../timeline-provider", () => ({
  useTimelineContext: () => mocks.context,
  useTimelineDragging: () => [mocks.dragging, mocks.setDragging],
  useTimelineScrollX: () => [mocks.scrollX, vi.fn()],
  useTimelineSidebarWidth: () => [mocks.sidebarWidth, vi.fn()],
  useTimelineContainerWidth: () => [mocks.containerWidth, vi.fn()],
}));

vi.mock("@uidotdev/usehooks", () => ({
  useMouse: () => [mocks.mouse, { current: mocks.mouseElement }],
  useThrottle: (value: number) => value,
  useWindowScroll: () => [mocks.windowScroll],
}));

vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({
    children,
    onDragStart,
    onDragMove,
    onDragEnd,
    sensors,
  }: React.PropsWithChildren<{
    onDragStart?: () => void;
    onDragMove?: () => void;
    onDragEnd?: (event: { canceled: boolean }) => void;
    sensors?: (defaults: unknown[]) => unknown[];
  }>) => (
    <div data-sensor-count={sensors?.(["default", mocks.pointerSensor]).length}>
      <button type="button" onClick={onDragStart}>
        drag-start
      </button>
      <button type="button" onClick={onDragMove}>
        drag-move
      </button>
      <button type="button" onClick={() => onDragEnd?.({ canceled: false })}>
        drag-end
      </button>
      <button type="button" onClick={() => onDragEnd?.({ canceled: true })}>
        drag-cancel
      </button>
      {children}
    </div>
  ),
  useDraggable: () => ({ isDragging: mocks.draggable, ref: vi.fn() }),
}));

vi.mock("@dnd-kit/dom", () => ({
  PointerSensor: mocks.pointerSensor,
  PointerActivationConstraints: {
    Distance: class Distance {
      constructor(public value: unknown) {}
    },
  },
}));

vi.mock("@dnd-kit/abstract/modifiers", () => ({
  RestrictToHorizontalAxis: "horizontal",
}));

vi.mock("@notion-kit/icons", () => ({
  Icon: new Proxy(
    {},
    {
      get:
        (_target, name) =>
        ({
          side,
          ...props
        }: React.ComponentProps<"span"> & { side?: string }) => (
          <span data-icon={String(name)} data-side={side} {...props} />
        ),
    },
  ),
}));

vi.mock("@/primitives", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  ContextMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  ContextMenuContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  ContextMenuItem: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  ContextMenuTrigger: ({ render }: { render: React.ReactNode }) => render,
  ScrollArea: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  ),
  Select: ({
    children,
    onValueChange,
  }: React.PropsWithChildren<{
    onValueChange: (value: TimelineRange | null) => void;
  }>) => (
    <div>
      <button type="button" onClick={() => onValueChange("quarterly")}>
        select-quarterly
      </button>
      <button type="button" onClick={() => onValueChange(null)}>
        select-null
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectGroup: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectItem: ({ label, value }: { label: string; value: string }) => (
    <div data-value={value}>{label}</div>
  ),
  SelectTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectValue: () => <span>selected range</span>,
  TooltipPreset: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

function setTimeline(
  range: TimelineRange = "monthly",
  overrides: Partial<TimelineContextProps> = {},
) {
  const start = new Date(2026, 0, 1);
  Object.assign(mocks.context, {
    range,
    zoom: 100,
    onAddItem: vi.fn(),
    timelineData: createTimelineData(
      range,
      start.getTime(),
      new Date(2026, 11, 31).getTime(),
    ),
    ref: { current: null },
    scrollToFeature: vi.fn(),
    ...overrides,
  });
}

describe("timeline components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dragging = false;
    mocks.draggable = false;
    mocks.scrollX = 0;
    mocks.sidebarWidth = 0;
    mocks.containerWidth = 500;
    mocks.mouse = { x: 0, y: 0 };
    mocks.mouseElement = null;
    mocks.windowScroll = { x: 0, y: 0 };
    setTimeline();
  });

  it("UseVisibleRange_EmptyTimeline_ReturnsStableEmptyWindow", () => {
    setTimeline("monthly", {
      timelineData: {
        start: new Date(2026, 0, 1),
        end: new Date(2026, 0, 1),
        ranges: [],
        subRanges: [],
      },
    });
    mocks.scrollX = 40;

    const { result } = renderHook(() => useVisibleRange());

    expect(result.current).toEqual({
      startIndex: 0,
      endIndex: 0,
      scrollLeft: 40,
    });
  });

  it.each([
    ["daily" as const, 0, 48],
    ["monthly" as const, 1, 11],
    ["quarterly" as const, 7, 3],
  ])(
    "UseVisibleRange_%sViewport_ClampsAndOverscansVisibleColumns",
    (range, expectedStart, expectedEnd) => {
      setTimeline(range);
      mocks.scrollX = 1000;
      mocks.sidebarWidth = 100;
      mocks.containerWidth = 500;

      const { result } = renderHook(() => useVisibleRange());

      expect(result.current.startIndex).toBe(expectedStart);
      expect(result.current.endIndex).toBe(expectedEnd);
      expect(result.current.scrollLeft).toBe(1000);
    },
  );

  it("TimelineContentWrappers_CustomProps_AreForwardedWithSlots", () => {
    render(
      <>
        <TimelineContent className="opacity-50" title="content" />
        <TimelineListGroup className="block" title="group" />
        <TimelineList className="flex" title="list" />
      </>,
    );

    expect(screen.getByTitle("content")).toHaveAttribute(
      "data-slot",
      "timeline-content",
    );
    expect(screen.getByTitle("group")).toHaveClass("block");
    expect(screen.getByTitle("list")).toHaveClass("flex");
  });

  it("TimelineColumn_SecondaryNonFirstColumn_AppliesPositionAndStyles", () => {
    const { container } = render(
      <TimelineColumn index={2} isColumnSecondary={() => true} />,
    );

    const column = container.querySelector('[data-slot="timeline-column"]');
    expect(column).toHaveStyle({ width: "150px", left: "300px" });
    expect(column).toHaveClass("border-l", "bg-default/5");
  });

  it("TimelineColumns_HoveredWhileIdle_ShowsAddHelperAtPointerColumn", () => {
    const { container } = render(
      <TimelineColumns isColumnSecondary={(index) => index % 2 === 0} />,
    );
    const columns = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-columns"]',
    )!;
    vi.spyOn(columns, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      width: 500,
      height: 300,
      right: 510,
      bottom: 320,
      x: 10,
      y: 20,
      toJSON: vi.fn(),
    });

    fireEvent.mouseEnter(columns);
    fireEvent.mouseMove(columns, { clientX: 325, clientY: 92 });

    expect(
      container.querySelector('[data-slot="timeline-add-feature-helper"]'),
    ).toHaveStyle({ left: "300px", width: "150px" });
    expect(
      container.querySelectorAll('[data-slot="timeline-column"]'),
    ).toHaveLength(10);

    fireEvent.mouseLeave(columns);
    expect(
      container.querySelector('[data-slot="timeline-add-feature-helper"]'),
    ).not.toBeInTheDocument();
  });

  it("TimelineColumns_DraggingOrMissingCallback_DoesNotShowAddHelper", () => {
    mocks.dragging = true;
    setTimeline("monthly", { onAddItem: undefined });
    const { container } = render(<TimelineColumns />);
    const columns = container.querySelector('[data-slot="timeline-columns"]')!;

    fireEvent.mouseEnter(columns);

    expect(
      container.querySelector('[data-slot="timeline-add-feature-helper"]'),
    ).not.toBeInTheDocument();
  });

  it("TimelineAddFeatureHelper_Click_ConvertsViewportPositionAndAddsItem", async () => {
    const onAddItem = vi.fn();
    const timelineElement = document.createElement("div");
    vi.spyOn(timelineElement, "getBoundingClientRect").mockReturnValue({
      left: 20,
    } as DOMRect);
    setTimeline("monthly", {
      onAddItem,
      ref: { current: timelineElement },
    });
    mocks.mouse = { x: 245, y: 0 };
    mocks.scrollX = 100;
    mocks.sidebarWidth = 25;

    const { container } = render(
      <TimelineAddFeatureHelper top={72} className="relative" />,
    );
    await userEvent.click(screen.getByRole("button"));

    expect(onAddItem).toHaveBeenCalledWith(new Date(2026, 2, 1).getTime());
    expect(
      container.querySelector('[data-slot="timeline-add-feature-helper"]'),
    ).toHaveStyle({ marginTop: "-18px", transform: "translateY(72px)" });
  });

  it("TimelineAddFeatureHelper_MissingTimelineElement_UsesViewportOrigin", async () => {
    const onAddItem = vi.fn();
    setTimeline("daily", { onAddItem, ref: null });
    mocks.mouse = { x: 100, y: 0 };

    render(<TimelineAddFeatureHelper top={0} />);
    await userEvent.click(screen.getByRole("button"));

    expect(onAddItem).toHaveBeenCalledWith(new Date(2026, 0, 3).getTime());
  });

  it("TimelineAddFeatureHelper_LocalCallback_OverridesProviderCallback", async () => {
    const providerOnAddItem = vi.fn();
    const localOnAddItem = vi.fn();
    setTimeline("daily", { onAddItem: providerOnAddItem, ref: null });
    mocks.mouse = { x: 100, y: 0 };

    render(<TimelineAddFeatureHelper top={0} onAddItem={localOnAddItem} />);
    await userEvent.click(screen.getByRole("button"));

    expect(localOnAddItem).toHaveBeenCalledWith(new Date(2026, 0, 3).getTime());
    expect(providerOnAddItem).not.toHaveBeenCalled();
  });

  it("GanttCreateMarkerTrigger_Click_ReportsDateAtMousePosition", async () => {
    const onCreateMarker = vi.fn();
    mocks.mouse = { x: 225, y: 0 };
    mocks.windowScroll = { x: 25, y: 0 };

    render(<GanttCreateMarkerTrigger onCreateMarker={onCreateMarker} />);
    await userEvent.click(screen.getByRole("button"));

    expect(onCreateMarker).toHaveBeenCalledWith(
      new Date(2026, 1, 11).getTime(),
    );
    expect(screen.getByText("Feb 11, 2026")).toBeInTheDocument();
  });

  it("GanttCreateMarkerTrigger_OffsetElement_SubtractsElementAndWindowOffsets", async () => {
    const onCreateMarker = vi.fn();
    const mouseElement = document.createElement("div");
    vi.spyOn(mouseElement, "getBoundingClientRect").mockReturnValue({
      x: 25,
    } as DOMRect);
    mocks.mouseElement = mouseElement;
    mocks.mouse = { x: 250, y: 0 };
    mocks.windowScroll = { x: 25, y: 0 };

    render(<GanttCreateMarkerTrigger onCreateMarker={onCreateMarker} />);
    await userEvent.click(screen.getByRole("button"));

    expect(onCreateMarker).toHaveBeenCalledWith(
      new Date(2026, 1, 11).getTime(),
    );
  });

  it("GanttMarker_RemovableMarker_RendersOffsetAndRemovesById", async () => {
    const onRemove = vi.fn();
    const { container, rerender } = render(
      <GanttMarker
        id="release"
        label="Release"
        date={new Date(2026, 1, 15).getTime()}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("Release")).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle("transform: translateX(225px)");
    await userEvent.click(
      screen.getByRole("button", { name: /remove marker/i }),
    );
    expect(onRemove).toHaveBeenCalledWith("release");

    rerender(
      <GanttMarker
        id="release"
        label="Release"
        date={new Date(2026, 1, 15).getTime()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /remove marker/i }),
    ).not.toBeInTheDocument();
  });

  it("TimelineRangeHeader_VisibleWindow_RendersGroupedAndAlternatingColumns", () => {
    mocks.sidebarWidth = 120;
    const { container } = render(
      <TimelineRangeHeader className="overflow-hidden" />,
    );

    expect(
      container.querySelector('[data-slot="timeline-range-header"]'),
    ).toHaveStyle({ width: "1800px" });
    expect(
      container.querySelectorAll('[data-slot="timeline-range"]'),
    ).toHaveLength(1);
    expect(
      container.querySelector('[data-slot="timeline-range"] > div'),
    ).toHaveStyle({ insetInlineStart: "120px" });
    expect(
      container.querySelectorAll('[data-slot="timeline-sub-range"]'),
    ).toHaveLength(9);
  });

  it("TimelineRangeHeader_NoVisibleGroups_RendersNoSpacerOrGroups", () => {
    setTimeline("monthly", {
      timelineData: {
        start: new Date(2026, 0, 1),
        end: new Date(2026, 0, 1),
        ranges: [],
        subRanges: [],
      },
    });
    const { container } = render(<TimelineRangeHeader />);

    expect(
      container.querySelectorAll('[data-slot="timeline-range"]'),
    ).toHaveLength(0);
  });

  it("TimelineRangeHeader_LaterVisibleGroup_RendersSpacerAndTodayEmphasis", () => {
    const subRanges = Array.from({ length: 24 }, (_, index) => ({
      label: String(index + 1),
      start: index * 150,
      isToday: index === 15,
    }));
    setTimeline("monthly", {
      timelineData: {
        start: new Date(2026, 0, 1),
        end: new Date(2027, 11, 31),
        ranges: [
          { label: "2026", start: 0 },
          { label: "2027", start: 1800 },
        ],
        subRanges,
      },
    });
    mocks.scrollX = 3000;
    const { container } = render(<TimelineRangeHeader />);

    expect(screen.getByText("2027").parentElement).toHaveStyle({
      width: "1800px",
    });
    expect(
      container.querySelector(
        '[data-slot="timeline-range-header"] > div > div > div',
      ),
    ).toHaveStyle({ width: "1800px", flexShrink: "0" });
    expect(
      container.querySelector('[data-slot="timeline-sub-range"].text-white'),
    ).toHaveTextContent("16");
  });

  it("TimelineRangeSelect_ValueAndNullChanges_OnlyForwardsConcreteRange", async () => {
    const onChange = vi.fn();
    render(<TimelineRangeSelect value="daily" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "select-null" }));
    await userEvent.click(
      screen.getByRole("button", { name: "select-quarterly" }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("quarterly");
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Quarter")).toBeInTheDocument();
  });

  it("TimelineSidebarParts_DefaultsAndCallbacks_RenderExpectedContracts", async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    render(
      <>
        <TimelineSidebar className="w-full" style={{ width: 240 }}>
          child
        </TimelineSidebar>
        <TimelineSidebarHeader title="header" />
        <TimelineSidebarBody title="body">body</TimelineSidebarBody>
        <TimelineSidebarTrigger onClick={onOpen} />
        <TimelineSidebarClose onClick={onClose} />
      </>,
    );

    await userEvent.click(screen.getAllByRole("button")[0]!);
    await userEvent.click(screen.getByRole("button", { name: "Hide table" }));

    expect(onOpen).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(
      screen.getByText("child").closest('[data-slot="timeline-sidebar"]'),
    ).toHaveClass("w-full");
    expect(screen.getByTitle("header")).toHaveAttribute(
      "data-slot",
      "timeline-sidebar-header",
    );
  });

  it.each(["daily", "monthly", "quarterly"] as const)(
    "TimelineJumpTo_%sRange_JumpsBackwardForwardAndToday",
    async (range) => {
      const scrollTo = vi.fn<(options: ScrollToOptions) => void>();
      const element = document.createElement("div");
      Object.defineProperties(element, {
        scrollLeft: { configurable: true, value: 300, writable: true },
        clientWidth: { configurable: true, value: 600 },
        scrollTo: { configurable: true, value: scrollTo },
      });
      setTimeline(range, { ref: { current: element } });
      mocks.sidebarWidth = 100;
      render(<TimelineJumpTo />);

      await userEvent.click(screen.getByRole("button", { name: "Previous" }));
      await userEvent.click(screen.getByRole("button", { name: "Today" }));
      await userEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(scrollTo).toHaveBeenCalledTimes(3);
      expect(
        scrollTo.mock.calls.every(
          ([options]) =>
            typeof options.left === "number" && options.behavior === "smooth",
        ),
      ).toBe(true);
    },
  );

  it("TimelineJumpTo_MissingScrollElement_IgnoresCommands", async () => {
    render(<TimelineJumpTo />);

    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    await userEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(mocks.context.ref?.current).toBeNull();
  });

  it("TimelineJumpToItem_OutOfBoundsItems_ShowCorrectControlAndScroll", async () => {
    const scrollToFeature = vi.fn();
    setTimeline("monthly", { scrollToFeature });
    mocks.scrollX = 500;
    mocks.sidebarWidth = 100;
    mocks.containerWidth = 500;
    const leftItem = {
      id: "left",
      name: "Left",
      startAt: new Date(2026, 0, 1).getTime(),
      endAt: new Date(2026, 0, 2).getTime(),
    };
    const { rerender } = render(<TimelineJumpToItem item={leftItem} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveClass("opacity-100");
    expect(buttons[1]).not.toHaveClass("opacity-100");
    await userEvent.click(buttons[0]!);
    expect(scrollToFeature).toHaveBeenCalledWith(leftItem);

    const rightItem = {
      ...leftItem,
      id: "right",
      startAt: new Date(2026, 11, 1).getTime(),
      endAt: new Date(2026, 11, 2).getTime(),
    };
    rerender(<TimelineJumpToItem item={rightItem} />);
    expect(screen.getAllByRole("button")[1]).toHaveClass("opacity-100");
  });

  it("TimelineToolbar_WithAndWithoutSidebarAction_AlignsToContainer", () => {
    const onRangeChange = vi.fn();
    const onSidebarOpen = vi.fn();
    const { container, rerender } = render(
      <TimelineHeaderToolbar
        onRangeChange={onRangeChange}
        onSidebarOpen={onSidebarOpen}
      />,
    );

    expect(
      container.querySelectorAll('[data-slot="timeline-toolbar"]'),
    ).toHaveLength(2);
    expect(
      container.querySelectorAll('[data-slot="timeline-toolbar"]')[1],
    ).toHaveStyle({ insetInlineStart: "230px" });

    mocks.containerWidth = 0;
    rerender(<TimelineHeaderToolbar onRangeChange={onRangeChange} />);
    expect(
      container.querySelectorAll('[data-slot="timeline-toolbar"]'),
    ).toHaveLength(1);
    expect(
      container.querySelector('[data-slot="timeline-toolbar"]'),
    ).toHaveStyle({ insetInlineStart: "0px" });

    rerender(<TimelineToolbar title="plain" />);
    expect(screen.getByTitle("plain")).toHaveAttribute(
      "data-slot",
      "timeline-toolbar",
    );
  });

  it("TimelineToday_CurrentDate_RendersMarkerAtCalculatedOffset", () => {
    const { container } = render(<TimelineToday />);

    const marker = container.querySelector<HTMLElement>(
      '[data-slot="timeline-today"]',
    )!;
    expect(marker).toHaveStyle({ width: "0px" });
    expect(marker.style.transform).toMatch(/^translateX\(.+px\)$/);
  });

  it.each([
    ["daily" as const, new Date(2026, 0, 1), null, 100],
    ["daily" as const, new Date(2026, 0, 1), new Date(2026, 0, 1), 50],
    ["monthly" as const, new Date(2026, 0, 1), new Date(2026, 0, 1), 5],
    ["monthly" as const, new Date(2026, 0, 1), new Date(2026, 0, 15), 68],
    ["monthly" as const, new Date(2026, 0, 20), new Date(2026, 2, 10), 252],
    ["quarterly" as const, new Date(2026, 0, 1), new Date(2026, 0, 15), 16],
  ])(
    "TimelineItem_%sDateSpan_ComputesExpectedWidth",
    (range, startAt, endAt, expectedWidth) => {
      setTimeline(range);
      const { container } = render(
        <TimelineItem
          item={{
            id: "item",
            name: "Item",
            startAt: startAt.getTime(),
            endAt: endAt?.getTime() ?? 0,
          }}
          render={() => <span>card</span>}
        />,
      );

      expect(
        container.querySelector('[data-slot="notion-timeline-item"]'),
      ).toHaveStyle({ width: `${expectedWidth}px` });
      expect(screen.getByText("card")).toBeInTheDocument();
    },
  );

  it("TimelineItem_DragLifecycle_MovesCommitsAndRestoresDates", async () => {
    const onMove = vi.fn();
    const startAt = new Date(2026, 0, 10).getTime();
    const endAt = new Date(2026, 0, 12).getTime();
    setTimeline("daily");
    mocks.mouse = { x: 100, y: 0 };
    const { rerender } = render(
      <TimelineItem
        item={{ id: "item", name: "Item", startAt, endAt }}
        onMove={onMove}
      />,
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-start" })[1]!,
    );
    expect(mocks.setDragging).toHaveBeenCalledWith(true);
    mocks.mouse = { x: 200, y: 0 };
    rerender(
      <TimelineItem
        item={{ id: "item", name: "Item", startAt, endAt }}
        onMove={onMove}
      />,
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-move" })[1]!,
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-end" })[1]!,
    );

    expect(mocks.setDragging).toHaveBeenCalledWith(false);
    expect(onMove).toHaveBeenCalledWith(
      "item",
      new Date(2026, 0, 12).getTime(),
      new Date(2026, 0, 14).getTime(),
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-start" })[1]!,
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-cancel" })[1]!,
    );
    expect(onMove).toHaveBeenCalledTimes(1);
  });

  it("TimelineItem_OpenEndedDrag_MovesStartWithoutCreatingEndDate", async () => {
    const onMove = vi.fn();
    const startAt = new Date(2026, 0, 10).getTime();
    setTimeline("daily");
    mocks.mouse = { x: 100, y: 0 };
    mocks.draggable = true;
    const { container, rerender } = render(
      <TimelineItem
        item={{ id: "open", name: "Open", startAt, endAt: 0 }}
        onMove={onMove}
      />,
    );
    expect(
      container.querySelector('[data-slot="notion-timeline-item-properties"]'),
    ).toHaveClass("cursor-grabbing");

    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-start" })[1]!,
    );
    mocks.mouse = { x: 150, y: 0 };
    rerender(
      <TimelineItem
        item={{ id: "open", name: "Open", startAt, endAt: 0 }}
        onMove={onMove}
      />,
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-move" })[1]!,
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "drag-end" })[1]!,
    );

    expect(onMove).toHaveBeenCalledWith(
      "open",
      new Date(2026, 0, 11).getTime(),
      null,
    );
  });

  it("TimelineItemResizer_DragLifecycle_PreviewsRestoresAndCommitsDate", async () => {
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();
    const timelineElement = document.createElement("div");
    vi.spyOn(timelineElement, "getBoundingClientRect").mockReturnValue({
      left: 20,
    } as DOMRect);
    setTimeline("monthly", { ref: { current: timelineElement } });
    mocks.mouse = { x: 245, y: 0 };
    mocks.scrollX = 100;
    mocks.sidebarWidth = 25;
    mocks.draggable = true;
    const initialDate = new Date(2026, 0, 10);
    const { container, rerender } = render(
      <TimelineItemResizer
        id="item"
        direction="left"
        ts={initialDate.getTime()}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />,
    );

    const resizer = container.querySelector(
      '[data-slot="timeline-item-resizer"]',
    );
    expect(resizer).toHaveClass("-inset-s-1.5", "opacity-100");
    expect(screen.getByText("Jan 10, 2026")).toHaveClass("text-end");

    await userEvent.click(screen.getByRole("button", { name: "drag-move" }));
    expect(onDragMove).toHaveBeenLastCalledWith(new Date(2026, 2, 1));

    await userEvent.click(screen.getByRole("button", { name: "drag-start" }));
    expect(mocks.setDragging).toHaveBeenLastCalledWith(true);
    await userEvent.click(screen.getByRole("button", { name: "drag-cancel" }));
    expect(mocks.setDragging).toHaveBeenLastCalledWith(false);
    expect(onDragMove).toHaveBeenLastCalledWith(initialDate);
    expect(onDragEnd).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "drag-start" }));
    await userEvent.click(screen.getByRole("button", { name: "drag-end" }));
    expect(onDragEnd).toHaveBeenCalledOnce();

    mocks.draggable = false;
    rerender(<TimelineItemResizer id="item" direction="right" ts={null} />);
    expect(
      container.querySelector('[data-slot="timeline-item-resizer"]'),
    ).toHaveClass("-inset-e-1.5");
    expect(screen.queryByText("Jan 10, 2026")).not.toBeInTheDocument();
    setTimeline("monthly", { ref: null });
    await userEvent.click(screen.getByRole("button", { name: "drag-move" }));
    await userEvent.click(screen.getByRole("button", { name: "drag-start" }));
    await userEvent.click(screen.getByRole("button", { name: "drag-cancel" }));
    await userEvent.click(screen.getByRole("button", { name: "drag-end" }));
  });

  it("TimelineRow_WithItem_RendersJumpControlAndItem", () => {
    const item = {
      id: "row",
      name: "Row",
      startAt: new Date(2026, 0, 1).getTime(),
      endAt: new Date(2026, 0, 2).getTime(),
    };
    const { container } = render(<TimelineRow item={item} />);

    expect(
      container.querySelector('[data-slot="timeline-jump-to-item"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="timeline-item"]'),
    ).toBeInTheDocument();
  });
});
