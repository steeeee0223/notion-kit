import { Icon } from "@notion-kit/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@notion-kit/ui/primitives";

import { useActiveRouteStops } from "@/adapters";

import { useRouteStore } from "./store";

export function RouteDetailsSheet() {
  const selectedRouteContext = useRouteStore(
    (state) => state.selectedRouteContext,
  );
  const setSelectedRouteContext = useRouteStore(
    (state) => state.setSelectedRouteContext,
  );

  const { data: stops = [], isLoading } = useActiveRouteStops(
    selectedRouteContext ?? {},
  );

  const isOpen = !!selectedRouteContext;
  const routeTitle = [
    selectedRouteContext?.routeShortName,
    selectedRouteContext?.routeLongName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setSelectedRouteContext(null);
      }}
    >
      <SheetContent hideClose side="right">
        <SheetHeader>
          <SheetTitle typography="h2">
            {routeTitle || `Route ${selectedRouteContext?.routeId ?? "-"}`}
          </SheetTitle>
          <SheetDescription>
            {selectedRouteContext?.agencyName ??
              (selectedRouteContext?.tripId
                ? `Trip: ${selectedRouteContext.tripId}`
                : selectedRouteContext?.routeId)}
          </SheetDescription>
        </SheetHeader>
        {selectedRouteContext?.routeId && (
          <div className="border-b px-4 py-2 text-xs text-secondary">
            Route ID: {selectedRouteContext.routeId}
          </div>
        )}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Icon.Map className="size-3.5 fill-icon" />
          <span className="text-xs text-secondary">Stops</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="size-5 animate-spin rounded-full border-2 border-secondary border-t-primary" />
            </div>
          )}

          {!isLoading && stops.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary">
              <Icon.Map className="size-8 fill-icon" />
              <span className="text-sm">No stops available</span>
            </div>
          )}

          {!isLoading && stops.length > 0 && (
            <div className="relative mt-2 ml-2 space-y-4 border-l-2 border-default/20 pb-6">
              {stops.map((stop, index) => (
                <div key={`${stop.id}-${index}`} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute top-1.5 left-[-5px] size-2 rounded-full bg-primary" />

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">
                      {stop.stopName}
                    </span>
                    <span className="text-xs text-secondary">
                      {stop.stopId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
