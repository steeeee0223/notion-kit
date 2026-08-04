import { StrictMode, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  ColumnDefs,
  DataResourceAction,
  PropertiesResourceAction,
  ResourceChange,
  Row,
  TableViewState,
  ViewResourceAction,
} from "@notion-kit/table-hook";

import type { DefaultPlugins } from "@/plugins";
import { TableView } from "@/table-contexts";

import { mockResizeObserver } from "../__tests__/mock";

mockResizeObserver();

type DefaultProperties = ColumnDefs<DefaultPlugins>;
type DefaultRow = Row<DefaultPlugins>;

const titleProperty = {
  id: "title",
  name: "Name",
  type: "title",
  config: { showIcon: false },
} as const satisfies DefaultProperties[number];

const dateProperty = {
  id: "due",
  name: "Due",
  type: "date",
  config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
} as const satisfies DefaultProperties[number];

const row = {
  id: "row-1",
  createdAt: 200,
  lastEditedAt: 100,
  properties: {
    title: { id: "cell-title", value: "Task" },
  },
} satisfies DefaultRow;

function timelineView(overrides: Partial<TableViewState> = {}): TableViewState {
  return {
    layout: "timeline",
    rowView: "side",
    openedRowId: null,
    locked: false,
    timeline: { range: "monthly", datePropertyId: null },
    ...overrides,
  };
}

describe("useTimelineViewState", () => {
  it("TimelineInitialization_ValidPersistedProperty_RendersReadyWithoutMutation", async () => {
    const onPropertiesChange = vi.fn();
    const onDataChange = vi.fn();
    const onViewChange = vi.fn();

    render(
      <TableView<DefaultPlugins>
        data={[row]}
        properties={[titleProperty, dateProperty]}
        view={timelineView({
          timeline: { range: "monthly", datePropertyId: "due" },
        })}
        onPropertiesChange={onPropertiesChange}
        onDataChange={onDataChange}
        onViewChange={onViewChange}
      />,
    );

    expect(await screen.findByTestId("timeline-view-ready")).toHaveAttribute(
      "data-property-id",
      "due",
    );
    expect(onPropertiesChange).not.toHaveBeenCalled();
    expect(onDataChange).not.toHaveBeenCalled();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("TimelineInitialization_InvalidPersistedProperty_SelectsFirstUsableDate", async () => {
    const onViewChange = vi.fn();

    render(
      <AcceptingHarness
        data={[row]}
        properties={[titleProperty, dateProperty]}
        initialView={timelineView({
          timeline: { range: "monthly", datePropertyId: "missing" },
        })}
        onViewChange={onViewChange}
      />,
    );

    expect(await screen.findByTestId("timeline-view-ready")).toHaveAttribute(
      "data-property-id",
      "due",
    );
    expect(onViewChange).toHaveBeenCalledTimes(1);
    expect(onViewChange.mock.calls[0]?.[0]).toMatchObject({
      action: {
        type: "view.timeline_property.change",
        payload: { nextDatePropertyId: "due" },
      },
    });
  });

  it("TimelineInitialization_NoDateProperty_CreatesSeedsAndSelectsExactlyOnceInOrder", async () => {
    const events: ResourceChange<
      unknown,
      { id: string; type: string }
    >["action"][] = [];
    let seededData: DefaultRow[] | undefined;

    render(
      <AcceptingHarness
        data={[row]}
        properties={[titleProperty]}
        initialView={timelineView()}
        onPropertiesChange={(change) => events.push(change.action)}
        onDataChange={(change) => {
          events.push(change.action);
          seededData = change.next;
        }}
        onViewChange={(change) => events.push(change.action)}
      />,
    );

    const ready = await screen.findByTestId("timeline-view-ready");
    const propertyId = ready.getAttribute("data-property-id");
    expect(propertyId).toBeTruthy();
    expect(events.map((event) => event.type)).toEqual([
      "properties.create",
      "data.cell.update",
      "view.timeline_property.change",
    ]);
    expect(new Set(events.map((event) => event.id)).size).toBe(1);
    expect(seededData?.[0]?.properties[propertyId!]?.value).toEqual({
      start: 200,
      end: 200,
      endDate: true,
    });
  });

  it("TimelineInitialization_LockedWithoutDate_RendersReadOnlyEmptyWithoutMutation", async () => {
    const onPropertiesChange = vi.fn();
    const onDataChange = vi.fn();
    const onViewChange = vi.fn();

    render(
      <TableView<DefaultPlugins>
        data={[row]}
        properties={[titleProperty]}
        view={timelineView({ locked: true })}
        onPropertiesChange={onPropertiesChange}
        onDataChange={onDataChange}
        onViewChange={onViewChange}
      />,
    );

    expect(
      await screen.findByTestId("timeline-view-locked-empty"),
    ).toBeVisible();
    expect(onPropertiesChange).not.toHaveBeenCalled();
    expect(onDataChange).not.toHaveBeenCalled();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("TimelineInitialization_LockedWithFallbackDate_RendersFallbackWithoutRepair", async () => {
    const onPropertiesChange = vi.fn();
    const onDataChange = vi.fn();
    const onViewChange = vi.fn();

    render(
      <TableView<DefaultPlugins>
        data={[row]}
        properties={[titleProperty, dateProperty]}
        view={timelineView({
          locked: true,
          timeline: { range: "monthly", datePropertyId: "missing" },
        })}
        onPropertiesChange={onPropertiesChange}
        onDataChange={onDataChange}
        onViewChange={onViewChange}
      />,
    );

    expect(await screen.findByTestId("timeline-view-ready")).toHaveAttribute(
      "data-property-id",
      "due",
    );
    expect(onPropertiesChange).not.toHaveBeenCalled();
    expect(onDataChange).not.toHaveBeenCalled();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("TimelineInitialization_StrictModeNeverAcceptingOwner_EmitsOnceAndRemainsPending", async () => {
    const onPropertiesChange = vi.fn();
    const onDataChange = vi.fn();
    const onViewChange = vi.fn();

    render(
      <StrictMode>
        <TableView<DefaultPlugins>
          data={[row]}
          properties={[titleProperty]}
          view={timelineView()}
          onPropertiesChange={onPropertiesChange}
          onDataChange={onDataChange}
          onViewChange={onViewChange}
        />
      </StrictMode>,
    );

    expect(await screen.findByTestId("timeline-view-pending")).toBeVisible();
    await waitFor(() => expect(onPropertiesChange).toHaveBeenCalledTimes(1));
    expect(onDataChange).toHaveBeenCalledTimes(1);
    expect(onViewChange).toHaveBeenCalledTimes(1);
  });

  it("TimelineInitialization_PartialControlledAcceptance_DoesNotCreateAgain", async () => {
    const onPropertiesChange = vi.fn();
    const onDataChange = vi.fn();
    const onViewChange = vi.fn();

    render(
      <PropertiesOnlyHarness
        onPropertiesChange={onPropertiesChange}
        onDataChange={onDataChange}
        onViewChange={onViewChange}
      />,
    );

    expect(await screen.findByTestId("timeline-view-pending")).toBeVisible();
    await waitFor(() => expect(onPropertiesChange).toHaveBeenCalledTimes(1));
    expect(onDataChange).toHaveBeenCalledTimes(1);
    expect(onViewChange).toHaveBeenCalledTimes(1);
  });

  it("TimelineRouting_DefaultTimelineView_RendersTimelineBoundary", async () => {
    render(
      <TableView<DefaultPlugins>
        defaultData={[row]}
        defaultProperties={[titleProperty, dateProperty]}
        defaultView={timelineView({
          timeline: { range: "daily", datePropertyId: "due" },
        })}
      />,
    );

    expect(await screen.findByTestId("timeline-view-ready")).toHaveAttribute(
      "data-range",
      "daily",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

interface HarnessProps {
  data: DefaultRow[];
  properties: DefaultProperties;
  initialView: TableViewState;
  onPropertiesChange?: (
    change: ResourceChange<DefaultProperties, PropertiesResourceAction>,
  ) => void;
  onDataChange?: (change: ResourceChange<Row[], DataResourceAction>) => void;
  onViewChange?: (
    change: ResourceChange<TableViewState, ViewResourceAction>,
  ) => void;
}

function AcceptingHarness({
  data: initialData,
  properties: initialProperties,
  initialView,
  onPropertiesChange,
  onDataChange,
  onViewChange,
}: HarnessProps) {
  const [data, setData] = useState(initialData);
  const [properties, setProperties] = useState(initialProperties);
  const [view, setView] = useState(initialView);

  return (
    <TableView<DefaultPlugins>
      data={data}
      properties={properties}
      view={view}
      onPropertiesChange={(change) => {
        onPropertiesChange?.(change);
        setProperties(change.next);
      }}
      onDataChange={(change) => {
        onDataChange?.(change);
        setData(change.next);
      }}
      onViewChange={(change) => {
        onViewChange?.(change);
        setView(change.next);
      }}
    />
  );
}

function PropertiesOnlyHarness({
  onPropertiesChange,
  onDataChange,
  onViewChange,
}: Pick<HarnessProps, "onPropertiesChange" | "onDataChange" | "onViewChange">) {
  const [properties, setProperties] = useState<DefaultProperties>([
    titleProperty,
  ]);

  return (
    <TableView<DefaultPlugins>
      data={[row]}
      properties={properties}
      view={timelineView()}
      onPropertiesChange={(change) => {
        onPropertiesChange?.(change);
        setProperties(change.next);
      }}
      onDataChange={onDataChange}
      onViewChange={onViewChange}
    />
  );
}
