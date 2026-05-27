import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@notion-kit/ui/primitives";

import { useActiveRouteStops, useActiveRouteTrips } from "@/adapters";
import type { RouteTrip } from "@/adapters";

import { useRouteStore } from "./store";

export function RouteDetailsSheet() {
  const selectedRouteContext = useRouteStore(
    (state) => state.selectedRouteContext,
  );
  const setSelectedRouteContext = useRouteStore(
    (state) => state.setSelectedRouteContext,
  );
  const expandedTripId = useRouteStore((state) => state.expandedTripId);
  const setExpandedTripId = useRouteStore((state) => state.setExpandedTripId);
  const [serviceDate, setServiceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const routeId = selectedRouteContext?.routeId ?? null;
  const normalizedStartTime = normalizeGtfsTime(startTime);
  const normalizedEndTime = normalizeGtfsTime(endTime);
  const { data: trips = [], isLoading: isTripsLoading } = useActiveRouteTrips(
    routeId,
    serviceDate,
    normalizedStartTime,
    normalizedEndTime,
  );
  const { data: stops = [], isLoading: isStopsLoading } = useActiveRouteStops({
    tripId: expandedTripId,
    routeId,
  });

  const isOpen = !!selectedRouteContext;
  const routeTitle = [
    selectedRouteContext?.routeShortName,
    selectedRouteContext?.routeLongName,
  ]
    .filter(Boolean)
    .join(" · ");
  const expandedTrip = trips.find((trip) => trip.id === expandedTripId);
  const sheetDescription =
    selectedRouteContext?.agencyName ??
    (selectedRouteContext?.tripId
      ? `Trip: ${selectedRouteContext.tripId}`
      : selectedRouteContext?.routeId);

  function handleClose() {
    setSelectedRouteContext(null);
  }

  function handleTripToggle(tripId: string) {
    setExpandedTripId(expandedTripId === tripId ? null : tripId);
  }

  function handleDateChange(value: string) {
    setServiceDate(value);
    setExpandedTripId(null);
  }

  function handleTimeChange(setter: (value: string) => void, value: string) {
    setter(value);
    setExpandedTripId(null);
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent hideClose side="right">
        <SheetHeader>
          <SheetTitle typography="h2">
            {routeTitle || `Route ${selectedRouteContext?.routeId ?? "-"}`}
          </SheetTitle>
          <SheetDescription>{sheetDescription}</SheetDescription>
        </SheetHeader>

        {selectedRouteContext?.routeId && (
          <div className="border-b px-4 py-2 text-xs text-secondary">
            Route ID: {selectedRouteContext.routeId}
          </div>
        )}

        <div className="grid grid-cols-[1fr_1fr] gap-2 border-b px-4 py-3">
          <Input
            type="date"
            value={serviceDate}
            disabled={!routeId}
            onChange={(event) => handleDateChange(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              value={startTime}
              disabled={!routeId}
              onChange={(event) =>
                handleTimeChange(setStartTime, event.target.value)
              }
            />
            <Input
              type="time"
              value={endTime}
              disabled={!routeId}
              onChange={(event) =>
                handleTimeChange(setEndTime, event.target.value)
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Icon.Map className="size-3.5 fill-icon" />
          <span className="text-xs text-secondary">Trips</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {isTripsLoading && routeId && (
            <div className="flex items-center justify-center py-12">
              <div className="size-5 animate-spin rounded-full border-2 border-secondary border-t-primary" />
            </div>
          )}

          {!isTripsLoading && routeId && trips.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary">
              <Icon.Map className="size-8 fill-icon" />
              <span className="text-sm">No trips in this time range</span>
            </div>
          )}

          {!isTripsLoading &&
            trips.map((trip) => (
              <TripRow
                key={trip.id}
                trip={trip}
                expanded={expandedTripId === trip.id}
                loading={isStopsLoading && expandedTripId === trip.id}
                stops={expandedTrip?.id === trip.id ? stops : []}
                onToggle={() => handleTripToggle(trip.id)}
              />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TripRow({
  trip,
  expanded,
  loading,
  stops,
  onToggle,
}: {
  trip: RouteTrip;
  expanded: boolean;
  loading: boolean;
  stops: {
    id: string;
    stopId: string;
    stopName: string;
  }[];
  onToggle: () => void;
}) {
  const title = trip.tripHeadsign || trip.tripShortName || trip.tripId;
  const timeRange = [trip.firstDepartureTime, trip.lastDepartureTime]
    .filter(Boolean)
    .join(" - ");
  const subtitle = [
    typeof trip.directionId === "number"
      ? `Direction ${trip.directionId}`
      : null,
    `${trip.matchingStopTimesCount} matching times`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="border-b border-default/10 py-2 last:border-0">
      <Button
        type="button"
        variant="hint"
        className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
        onClick={onToggle}
      >
        <Icon.Chevron
          side={expanded ? "down" : "right"}
          className="size-3 shrink-0 fill-icon"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-primary">
            {title}
          </div>
          <div className="truncate text-xs text-secondary">
            {timeRange || trip.tripId}
          </div>
        </div>
        <span className="shrink-0 text-xs text-secondary">{subtitle}</span>
      </Button>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="size-4 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      )}

      {expanded && !loading && stops.length === 0 && (
        <div className="px-8 py-3 text-xs text-secondary">
          No stops available for this trip
        </div>
      )}

      {expanded && !loading && stops.length > 0 && (
        <div className="mx-4 mt-2 mb-3 border-l-2 border-default/20 pb-2">
          <div className="mb-2 pl-4 text-xs text-secondary">
            {stops.length} stops
          </div>
          <div className="space-y-4">
            {stops.map((stop) => (
              <div key={stop.id} className="relative pl-6">
                <div className="absolute top-1.5 left-[-5px] size-2 rounded-full bg-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-primary">
                    {stop.stopName}
                  </span>
                  <span className="text-xs text-secondary">{stop.stopId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeGtfsTime(value: string) {
  if (/^\d{2,3}:[0-5]\d:[0-5]\d$/.test(value)) return value;
  if (/^\d{2,3}:[0-5]\d$/.test(value)) return `${value}:00`;
  return value;
}
