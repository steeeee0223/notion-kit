import React, { useState } from "react";
import groupBy from "lodash.groupby";

import { Icon } from "@notion-kit/icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@notion-kit/shadcn";
import {
  GanttCreateMarkerTrigger,
  TimelineContent,
  TimelineJumpTo,
  TimelineList,
  TimelineProvider,
  TimelineRangeHeader,
  TimelineRangeSelect,
  TimelineRow,
  TimelineToday,
  TimelineToolbar,
  type TimelineRange,
} from "@notion-kit/timeline";

import { exampleFeatures } from "../timeline-data";

export default function WithoutSidebar() {
  const [features, setFeatures] = useState(exampleFeatures);
  const groupedFeatures = groupBy(features, "group.name");
  const sortedGroupedFeatures = Object.fromEntries(
    Object.entries(groupedFeatures).sort(([nameA], [nameB]) =>
      nameA.localeCompare(nameB),
    ),
  );

  const handleViewFeature = (id: string) =>
    console.log(`Feature selected: ${id}`);

  const handleCopyLink = (id: string) => console.log(`Copy link: ${id}`);

  const handleRemoveFeature = (id: string) =>
    setFeatures((prev) => prev.filter((feature) => feature.id !== id));

  const handleCreateMarker = (ts: number) =>
    console.log(`Create marker: ${new Date(ts).toISOString()}`);

  const handleMoveFeature = (
    id: string,
    startAt: number,
    endAt: number | null,
  ) => {
    if (!endAt) {
      return;
    }

    setFeatures((prev) =>
      prev.map((feature) =>
        feature.id === id ? { ...feature, startAt, endAt } : feature,
      ),
    );

    console.log(
      `Move feature: ${id} from ${new Date(startAt).toISOString()} to ${new Date(endAt).toISOString()}`,
    );
  };

  const handleAddFeature = (ts: number) =>
    console.log(`Add feature: ${new Date(ts).toISOString()}`);

  const [range, setRange] = useState<TimelineRange>("monthly");

  return (
    <TimelineProvider
      className="border"
      onAddItem={handleAddFeature}
      range={range}
      zoom={100}
    >
      <TimelineContent>
        <TimelineRangeHeader />
        <TimelineList>
          {Object.entries(sortedGroupedFeatures).map(([group, features]) => (
            <React.Fragment key={group}>
              {features.map((feature) => (
                <TimelineRow
                  key={feature.id}
                  onMove={handleMoveFeature}
                  item={feature}
                  render={() => {
                    return (
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          {/* title  */}
                          <div
                            onPointerDown={() => handleViewFeature(feature.id)}
                            role="button"
                            className="me-2.5 flex w-full items-center gap-1.5 text-sm font-medium"
                          >
                            <Avatar className="size-5">
                              <AvatarImage src={feature.owner.image} />
                              <AvatarFallback>
                                {feature.owner.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="max-w-100 truncate text-xs">
                              {feature.name}
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuGroup>
                            <ContextMenuItem
                              Icon={<Icon.Eye />}
                              Body="View feature"
                              onClick={() => handleViewFeature(feature.id)}
                            />
                            <ContextMenuItem
                              Icon={<Icon.Link />}
                              Body="Copy link"
                              onClick={() => handleCopyLink(feature.id)}
                            />
                            <ContextMenuItem
                              Icon={<Icon.Trash />}
                              Body="Remove from roadmap"
                              onClick={() => handleRemoveFeature(feature.id)}
                            />
                          </ContextMenuGroup>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  }}
                />
              ))}
            </React.Fragment>
          ))}
        </TimelineList>
        {/* {exampleMarkers.map((marker) => (
          <GanttMarker
            key={marker.id}
            {...marker}
            onRemove={handleRemoveMarker}
          />
        ))} */}
        <TimelineToolbar className="sticky top-px right-0 pe-24 pt-[7px]">
          <TimelineRangeSelect value={range} onChange={setRange} />
          <TimelineJumpTo />
        </TimelineToolbar>
        <TimelineToday />
        <GanttCreateMarkerTrigger onCreateMarker={handleCreateMarker} />
      </TimelineContent>
    </TimelineProvider>
  );
}
