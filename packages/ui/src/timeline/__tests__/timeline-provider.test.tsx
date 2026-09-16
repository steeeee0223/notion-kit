import React, { useState } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  TimelineProvider,
  useTimelineContainerWidth,
  useTimelineContext,
  useTimelineDragging,
  useTimelineScrollX,
  useTimelineSidebarWidth,
} from "../timeline-provider";

vi.mock("@/primitives", () => ({
  TooltipProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("lodash.throttle", () => ({
  default: (callback: () => void) => callback,
}));

const observerState = {
  mutationCallbacks: [] as MutationCallback[],
  mutationDisconnect: vi.fn(),
  mutationObserve: vi.fn(),
  resizeCallbacks: [] as ResizeObserverCallback[],
  resizeDisconnect: vi.fn(),
  resizeObserve: vi.fn(),
  scrollTo: vi.fn(),
};

function TimelineProbe({ featureStartAt }: { featureStartAt?: number }) {
  const timeline = useTimelineContext();
  const [dragging, setDragging] = useTimelineDragging();
  const [scrollX] = useTimelineScrollX();
  const [sidebarWidth] = useTimelineSidebarWidth();
  const [containerWidth] = useTimelineContainerWidth();

  return (
    <div>
      <output data-testid="range">{timeline.range}</output>
      <output data-testid="pending">{String(timeline.isPending)}</output>
      <output data-testid="bounds">
        {timeline.timelineData.start.getTime()}:
        {timeline.timelineData.end.getTime()}
      </output>
      <output data-testid="state">
        {String(dragging)}:{scrollX}:{sidebarWidth}:{containerWidth}
      </output>
      <button type="button" onClick={() => setDragging(!dragging)}>
        toggle dragging
      </button>
      <button
        type="button"
        onClick={() =>
          timeline.scrollToFeature({
            id: "feature",
            name: "Feature",
            startAt:
              featureStartAt ??
              timeline.timelineData.start.getTime() - 86_400_000,
            endAt: timeline.timelineData.start.getTime(),
          })
        }
      >
        scroll to feature
      </button>
    </div>
  );
}

describe("TimelineProvider", () => {
  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    observerState.mutationCallbacks = [];
    observerState.resizeCallbacks = [];

    vi.stubGlobal(
      "MutationObserver",
      class MutationObserver {
        constructor(callback: MutationCallback) {
          observerState.mutationCallbacks.push(callback);
        }

        observe = observerState.mutationObserve;
        disconnect = observerState.mutationDisconnect;
        takeRecords = () => [];
      },
    );

    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          observerState.resizeCallbacks.push(callback);
        }

        observe = observerState.resizeObserve;
        unobserve = vi.fn();
        disconnect = observerState.resizeDisconnect;
      },
    );

    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(600);
    vi.spyOn(Element.prototype, "scrollTo").mockImplementation(
      observerState.scrollTo,
    );
  });

  it("TimelineProvider_ControlledProps_SynchronizesContextAtomsAndCss", async () => {
    const start = new Date(2026, 0, 1).getTime();
    const end = new Date(2026, 2, 31).getTime();
    const { container } = render(
      <TimelineProvider
        range="daily"
        zoom={80}
        startDate={start}
        endDate={end}
        sidebarWidth={240}
        className="opacity-50"
      >
        <TimelineProbe />
      </TimelineProvider>,
    );

    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent(/:240:/),
    );

    expect(screen.getByTestId("range")).toHaveTextContent("daily");
    expect(screen.getByTestId("bounds")).toHaveTextContent(`${start}:${end}`);
    expect(view).toHaveClass("daily", "opacity-50");
    expect(view).toHaveStyle({
      gridTemplateColumns: "240px 1fr",
    });
    expect(view.style.getPropertyValue("--timeline-column-width")).toBe("40px");
    expect(view.style.getPropertyValue("--timeline-sidebar-width")).toBe(
      "240px",
    );
    expect(observerState.mutationObserve).not.toHaveBeenCalledWith(view, {
      childList: true,
      subtree: true,
    });
    expect(observerState.resizeObserve).toHaveBeenCalledWith(view);

    act(() => {
      observerState.resizeCallbacks[0]?.(
        [
          {
            contentRect: { width: 720 },
          } as ResizeObserverEntry,
        ],
        {} as ResizeObserver,
      );
    });
    expect(screen.getByTestId("state")).toHaveTextContent(/:720$/);

    act(() => {
      observerState.resizeCallbacks[0]?.([], {} as ResizeObserver);
    });
    expect(screen.getByTestId("state")).toHaveTextContent(/:720$/);

    fireEvent.click(screen.getByRole("button", { name: "toggle dragging" }));
    expect(screen.getByTestId("state")).toHaveTextContent(/^true:/);

    view.scrollLeft = 321;
    fireEvent.scroll(view);
    expect(screen.getByTestId("state")).toHaveTextContent(/:321:/);

    fireEvent.click(screen.getByRole("button", { name: "scroll to feature" }));
    expect(observerState.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: "smooth",
    });
  });

  it("TimelineProvider_UncontrolledSidebar_TracksPresenceAndCleansObservers", async () => {
    const { container, unmount } = render(
      <TimelineProvider
        startDate={new Date(2026, 0, 1).getTime()}
        endDate={new Date(2026, 1, 1).getTime()}
      >
        <div data-slot="timeline-sidebar" />
        <TimelineProbe />
      </TimelineProvider>,
    );

    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent(/:300:/),
    );
    expect(observerState.mutationObserve).toHaveBeenCalledWith(view, {
      childList: true,
      subtree: true,
    });

    container.querySelector('[data-slot="timeline-sidebar"]')?.remove();
    act(() => {
      observerState.mutationCallbacks[0]?.([], {} as MutationObserver);
    });
    expect(screen.getByTestId("state")).toHaveTextContent(/:0:/);

    const mutationDisconnectsBeforeUnmount =
      observerState.mutationDisconnect.mock.calls.length;
    const resizeDisconnectsBeforeUnmount =
      observerState.resizeDisconnect.mock.calls.length;
    unmount();
    expect(observerState.mutationDisconnect).toHaveBeenCalledTimes(
      mutationDisconnectsBeforeUnmount + 1,
    );
    expect(observerState.resizeDisconnect).toHaveBeenCalledTimes(
      resizeDisconnectsBeforeUnmount + 1,
    );
  });

  it.each([
    ["sidebar", 240, 260],
    ["zero-width sidebar", 0, 500],
    ["sidebar wider than the feature offset", 600, 0],
  ])(
    "TimelineProvider_ScrollToFeature_%s_AlignsAtTheSidebarInlineEnd",
    async (_scenario, sidebarWidth, expectedScrollLeft) => {
      const start = new Date(2026, 0, 1).getTime();
      const featureStartAt = new Date(2026, 0, 11).getTime();

      render(
        <TimelineProvider
          range="daily"
          startDate={start}
          endDate={new Date(2026, 1, 1).getTime()}
          sidebarWidth={sidebarWidth}
        >
          <TimelineProbe featureStartAt={featureStartAt} />
        </TimelineProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("state")).toHaveTextContent(
          new RegExp(`:${sidebarWidth}:`),
        ),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "scroll to feature" }),
      );

      expect(observerState.scrollTo).toHaveBeenCalledWith({
        left: expectedScrollLeft,
        behavior: "smooth",
      });
    },
  );

  it("TimelineProvider_RangeChanges_PreservesViewportCenter", async () => {
    const start = new Date(2025, 0, 1).getTime();
    const end = new Date(2027, 11, 31).getTime();
    const { container, rerender } = render(
      <TimelineProvider range="monthly" startDate={start} endDate={end}>
        <TimelineProbe />
      </TimelineProvider>,
    );
    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    view.scrollLeft = 450;

    rerender(
      <TimelineProvider range="quarterly" startDate={start} endDate={end}>
        <TimelineProbe />
      </TimelineProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("range")).toHaveTextContent("quarterly"),
    );
    expect(screen.getByTestId("pending")).toHaveTextContent("false");
    expect(view.scrollLeft).not.toBe(450);
  });

  it("UseTimelineContext_OutsideProvider_ReturnsSafeDefaultContext", () => {
    function DefaultProbe() {
      const timeline = useTimelineContext();
      timeline.scrollToFeature({
        id: "ignored",
        name: "Ignored",
        startAt: 0,
        endAt: 0,
      });
      timeline.onAddItem?.(0);
      return (
        <span>{timeline.ref === null ? timeline.range : "unexpected"}</span>
      );
    }

    render(<DefaultProbe />);

    expect(screen.getByText("monthly")).toBeInTheDocument();
  });
  it("TestTimelineProvider_ControlledAnchor_PositionsWithoutCallbackEcho", () => {
    const onAnchorDateChange = vi.fn<(date: number) => void>();
    const startDate = new Date(2026, 0, 1).getTime();
    const endDate = new Date(2026, 11, 31).getTime();
    const props = {
      range: "daily" as const,
      startDate,
      endDate,
      sidebarWidth: 200,
      onAnchorDateChange,
    };
    const { container, rerender } = render(
      <TimelineProvider {...props} anchorDate={new Date(2026, 0, 10).getTime()}>
        <TimelineProbe />
      </TimelineProvider>,
    );
    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    expect(view.scrollLeft).toBe(250);
    fireEvent.scroll(view);
    expect(onAnchorDateChange).not.toHaveBeenCalled();
    rerender(
      <TimelineProvider {...props} anchorDate={new Date(2026, 0, 20).getTime()}>
        <TimelineProbe />
      </TimelineProvider>,
    );
    expect(view.scrollLeft).toBe(750);
    fireEvent.scroll(view);
    expect(onAnchorDateChange).not.toHaveBeenCalled();
    rerender(
      <TimelineProvider
        {...props}
        sidebarWidth={300}
        anchorDate={new Date(2026, 0, 20).getTime()}
      >
        <TimelineProbe />
      </TimelineProvider>,
    );
    expect(view.scrollLeft).toBe(800);
    expect(onAnchorDateChange).not.toHaveBeenCalled();
  });

  it("TestTimelineProvider_RapidScrollThenUnmount_ReportsLatestCenterImmediately", () => {
    const onAnchorDateChange = vi.fn<(date: number) => void>();
    const { container, unmount } = render(
      <TimelineProvider
        range="daily"
        sidebarWidth={200}
        startDate={new Date(2026, 0, 1).getTime()}
        endDate={new Date(2026, 11, 31).getTime()}
        defaultAnchorDate={new Date(2026, 0, 10).getTime()}
        onAnchorDateChange={onAnchorDateChange}
      >
        <TimelineProbe />
      </TimelineProvider>,
    );
    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    view.scrollLeft = 400;
    fireEvent.scroll(view);
    view.scrollLeft = 500;
    fireEvent.scroll(view);
    unmount();
    expect(onAnchorDateChange.mock.calls.map(([date]) => date)).toEqual([
      new Date(2026, 0, 13).getTime(),
      new Date(2026, 0, 15).getTime(),
    ]);
  });

  it("TestTimelineProvider_RangeChange_PreservesExactDayWithoutRoundedPixelDrift", () => {
    const onAnchorDateChange = vi.fn<(date: number) => void>();
    const props = {
      startDate: new Date(2025, 0, 1).getTime(),
      endDate: new Date(2027, 11, 31).getTime(),
      sidebarWidth: 200,
      anchorDate: new Date(2026, 11, 16).getTime(),
      onAnchorDateChange,
    };
    const { container, rerender } = render(
      <TimelineProvider {...props} range="monthly">
        <TimelineProbe />
      </TimelineProvider>,
    );
    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    expect(view.scrollLeft).toBeCloseTo(23 * 150 + (15 / 31) * 150 - 200);
    rerender(
      <TimelineProvider {...props} range="daily">
        <TimelineProbe />
      </TimelineProvider>,
    );
    expect(view.scrollLeft).toBe(714 * 50 - 200);
    fireEvent.scroll(view);
    expect(onAnchorDateChange).not.toHaveBeenCalled();
  });

  it("TestTimelineProvider_DisplayTimeZone_UsesLocalDateAcrossUtcMidnight", () => {
    const onAnchorDateChange = vi.fn<(date: number) => void>();
    const { container } = render(
      <TimelineProvider
        range="daily"
        sidebarWidth={200}
        timeZone="America/New_York"
        startDate={Date.parse("2026-01-01T05:00:00Z")}
        endDate={Date.parse("2026-12-31T05:00:00Z")}
        anchorDate={Date.parse("2026-01-11T02:00:00Z")}
        onAnchorDateChange={onAnchorDateChange}
      >
        <TimelineProbe />
      </TimelineProvider>,
    );
    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    expect(view.scrollLeft).toBe(250);
    view.scrollLeft = 400;
    fireEvent.scroll(view);
    expect(onAnchorDateChange).toHaveBeenLastCalledWith(
      Date.parse("2026-01-13T05:00:00Z"),
    );
  });
  it("TestTimelineProvider_OwnerAcceptsScrolledAnchor_DoesNotSnapOrInterruptScrolling", () => {
    function ControlledTimeline() {
      const [anchorDate, setAnchorDate] = useState(
        new Date(2026, 0, 10).getTime(),
      );
      return (
        <TimelineProvider
          range="daily"
          sidebarWidth={200}
          startDate={new Date(2026, 0, 1).getTime()}
          endDate={new Date(2026, 11, 31).getTime()}
          anchorDate={anchorDate}
          onAnchorDateChange={setAnchorDate}
        >
          <TimelineProbe />
        </TimelineProvider>
      );
    }
    const { container } = render(<ControlledTimeline />);
    const view = container.querySelector<HTMLDivElement>(
      '[data-slot="timeline-view"]',
    )!;
    view.scrollLeft = 427;
    fireEvent.scroll(view);
    expect(view.scrollLeft).toBe(427);
  });
});
