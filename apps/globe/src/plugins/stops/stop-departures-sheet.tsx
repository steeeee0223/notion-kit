import { useMemo } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@notion-kit/ui/primitives";

import { useActiveStopDepartures } from "@/adapters";
import type { StopDeparture } from "@/adapters";
import { normalizeRouteColor } from "@/adapters/transitland/transfer";

import { useStopsStore } from "./store";

function formatTime(time: string | null): string {
  if (!time) return "—";
  const parts = time.split(":");
  return `${parts[0]}:${parts[1]}`;
}

function getDisplayTime(dep: StopDeparture) {
  const scheduled = dep.scheduledDeparture ?? dep.scheduledArrival;
  const estimated = dep.estimatedDeparture ?? dep.estimatedArrival;
  return {
    time: formatTime(estimated ?? scheduled),
    isRealtime: !!estimated,
    scheduledTime: estimated ? formatTime(scheduled) : null,
  };
}

interface DepartureGrouped {
  routeShortName: string;
  routeColor: string | null;
  headsign: string;
  departures: {
    time: string;
    isRealtime: boolean;
    scheduledTime: string | null;
  }[];
}

function groupDepartures(deps: StopDeparture[]): DepartureGrouped[] {
  const map = new Map<string, DepartureGrouped>();
  for (const dep of deps) {
    const key = `${dep.routeShortName}::${dep.tripHeadsign}`;
    let group = map.get(key);
    if (!group) {
      group = {
        routeShortName: dep.routeShortName,
        routeColor: dep.routeColor,
        headsign: dep.tripHeadsign,
        departures: [],
      };
      map.set(key, group);
    }
    group.departures.push(getDisplayTime(dep));
  }
  return Array.from(map.values());
}

export function StopDeparturesSheet() {
  const selectedStop = useStopsStore((state) => state.selectedStop);
  const setSelectedStop = useStopsStore((state) => state.setSelectedStop);
  const { data: departures = [], isLoading } = useActiveStopDepartures(
    selectedStop?.onestopId ?? null,
  );

  const grouped = useMemo(() => groupDepartures(departures), [departures]);

  return (
    <Sheet
      open={!!selectedStop}
      onOpenChange={(open) => {
        if (!open) setSelectedStop(null);
      }}
    >
      <SheetContent hideClose side="right">
        <SheetHeader>
          <SheetTitle typography="h2">
            {selectedStop?.stopName ?? "-"}
          </SheetTitle>
          <SheetDescription>{selectedStop?.stopId ?? "-"}</SheetDescription>
        </SheetHeader>
        {selectedStop && (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-b px-4 py-2 text-xs">
            <span className="text-secondary">Stop key</span>
            <span className="truncate">{selectedStop.onestopId}</span>
            <span className="text-secondary">Location</span>
            <span className="truncate">
              {selectedStop.latitude.toFixed(5)},{" "}
              {selectedStop.longitude.toFixed(5)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Icon.Clock className="size-3.5 fill-icon" />
          <span className="text-xs text-secondary">
            Upcoming departures (next 2h)
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="size-5 animate-spin rounded-full border-2 border-secondary border-t-primary" />
            </div>
          )}

          {!isLoading && grouped.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary">
              <Icon.Clock className="size-8 fill-icon" />
              <span className="text-sm">No upcoming departures</span>
            </div>
          )}

          {!isLoading &&
            grouped.map((group) => (
              <div
                key={`${group.routeShortName}-${group.headsign}`}
                className="border-b px-4 py-3 last:border-b-0"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="rounded-sm px-1.5 py-0.5 text-xs font-bold text-white"
                    style={{
                      backgroundColor: group.routeColor
                        ? normalizeRouteColor(group.routeColor)
                        : "#6b7280",
                    }}
                  >
                    {group.routeShortName}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {group.headsign || "—"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.departures.map((dep, i) => (
                    <div
                      key={i}
                      className={cn(
                        "relative rounded-md border px-2 py-1 text-xs font-medium",
                        dep.isRealtime
                          ? "border-[#448361]/30 bg-[#448361]/10 text-[#448361]"
                          : "border-default/20 bg-default/5 text-primary",
                      )}
                    >
                      <span>{dep.time}</span>
                      {dep.isRealtime && dep.scheduledTime && (
                        <span className="ml-1 text-[10px] text-secondary line-through">
                          {dep.scheduledTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
