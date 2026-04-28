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
  TimelineContent,
  TimelineHeaderToolbar,
  TimelineList,
  TimelineProvider,
  TimelineRangeHeader,
  TimelineRow,
  TimelineSidebar,
  TimelineSidebarBody,
  TimelineSidebarClose,
  TimelineSidebarHeader,
  TimelineToday,
  type TimelineRange,
} from "@notion-kit/timeline";

import { exampleFeatures } from "../timeline-data";

export default function WithSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const handleMoveFeature = (
    id: string,
    startAt: number,
    endAt: number | null,
  ) => {
    if (!endAt) return;

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
    >
      <TimelineContent>
        {/* 3. Timeline range header */}
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
        <TimelineToday />

        {/* 4. Timeline toolbar and sidebar */}
        <TimelineHeaderToolbar
          onRangeChange={setRange}
          onSidebarOpen={() => setSidebarOpen(true)}
        />
      </TimelineContent>
      {/* 4.1 Timeline sidebar */}
      {/* TODO add animation for sidebar open/close */}
      {sidebarOpen && (
        <TimelineSidebar>
          <TimelineSidebarHeader className="flex h-17 text-secondary shadow-[inset_0_-1px_0_var(--color-border),inset_0_1px_0_var(--color-border)]">
            <div className="flex w-full items-center px-2 pt-9 text-sm">
              <span className="truncate">Name</span>
            </div>
            <TimelineSidebarClose onClick={() => setSidebarOpen(false)} />
          </TimelineSidebarHeader>
          <TimelineSidebarBody>
            {Object.entries(sortedGroupedFeatures).map(([group, features]) => (
              <React.Fragment key={group}>
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex h-(--timeline-row-height) items-center border-b border-border px-2 text-sm"
                  >
                    <Avatar className="me-1.5 size-5">
                      <AvatarImage src={feature.owner.image} />
                      <AvatarFallback>
                        {feature.owner.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{feature.name}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </TimelineSidebarBody>
        </TimelineSidebar>
      )}
    </TimelineProvider>
  );
}
