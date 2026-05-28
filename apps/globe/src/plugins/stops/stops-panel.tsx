import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuLabel,
} from "@notion-kit/ui/primitives";

import {
  useAdapterBBoxStore,
  useAdapterStore,
  type RouteStop,
} from "@/adapters";
import {
  isUsableStaticFeed,
  useFeedStops,
  useStaticFeedStatus,
} from "@/adapters/transitland/use-static-feeds";
import * as GoogleIcon from "@/components/google-icons";
import { syncStaticTransitData } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";
import {
  isMapServerTransportProvider,
  type MapServerTransportProviderId,
} from "@/lib/transport-provider";
import {
  TransitEntitySearch,
  TransitStaticFeed,
  type TransitSearchItem,
} from "@/plugins/common";

import { useStopsStore } from "./store";

export function StopsPanel() {
  const queryClient = useQueryClient();
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);
  const bbox = useAdapterBBoxStore((state) => state.bbox);
  const requestFlyTo = useAdapterBBoxStore((state) => state.requestFlyTo);
  const selectedFeed = useStopsStore((state) => state.selectedFeed);
  const setSelectedFeed = useStopsStore((state) => state.setSelectedFeed);
  const recentStops = useStopsStore((state) => state.recentStops);
  const pushRecentStop = useStopsStore((state) => state.pushRecentStop);
  const setMapStop = useStopsStore((state) => state.setMapStop);
  const setSelectedStop = useStopsStore((state) => state.setSelectedStop);
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const transportProvider = getTransportProvider(activeAdapter);
  const isTransportProvider = isMapServerTransportProvider(activeAdapter);
  const previousAdapter = useRef(activeAdapter);

  useEffect(() => {
    if (previousAdapter.current !== activeAdapter) {
      setSelectedFeed(null);
      previousAdapter.current = activeAdapter;
    }
  }, [activeAdapter, setSelectedFeed]);

  const {
    data: candidates = [],
    isLoading: isFeedLoading,
    error: feedError,
  } = useStaticFeedStatus(
    transportProvider,
    bbox,
    isTransportProvider,
    (data) => data.candidates,
  );

  const canLoadStops = isUsableStaticFeed(selectedFeed);
  const { data: stopsData, isLoading: isStopsLoading } = useFeedStops(
    transportProvider,
    selectedFeed?.feedOnestopId ?? null,
    isTransportProvider && canLoadStops,
  );

  const stopItems = useMemo(
    () => stopsData?.map(toStopSearchItem) ?? [],
    [stopsData],
  );
  const recentItems = useMemo(
    () => recentStops.map(toStopSearchItem),
    [recentStops],
  );

  async function handleSync() {
    if (!bbox && !selectedFeed) {
      setMessage("Move the map before syncing feed.");
      return;
    }
    setIsSyncing(true);
    try {
      const result = await syncStaticTransitData(
        selectedFeed
          ? {
              feedIds: [selectedFeed.feedLookupKey],
              provider: transportProvider,
            }
          : { bbox, provider: transportProvider },
      );
      const stopsCount = result.synced.reduce(
        (total, feed) => total + feed.stopsCount,
        0,
      );
      setMessage(`Feed sync finished: ${stopsCount} stops synced.`);
      await queryClient.invalidateQueries({
        queryKey: queryKey.mapServer.staticFeedStatus(transportProvider, bbox),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKey.mapServer.stops(
          transportProvider,
          selectedFeed?.feedOnestopId ?? null,
        ),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Feed sync failed.");
    } finally {
      setIsSyncing(false);
    }
  }

  function handleStopSelect(stop: RouteStop) {
    pushRecentStop(stop);
    setSelectedStop(null);
    setMapStop(stop);
    requestFlyTo([stop.longitude, stop.latitude]);
  }

  return (
    <>
      <TransitStaticFeed
        bbox={bbox}
        candidates={candidates}
        error={feedError}
        isLoading={isFeedLoading}
        isSyncing={isSyncing}
        isStaticFeedSource={isTransportProvider}
        message={message}
        sourceLabel={
          activeAdapter === "simulator" ? "Simulator" : "Transitland"
        }
        selectedFeed={selectedFeed}
        onSelectFeed={setSelectedFeed}
        onSync={handleSync}
      />
      <MenuGroup>
        <TransitEntitySearch
          label="Search stops"
          placeholder="Search stops..."
          items={stopItems}
          recentItems={recentItems}
          disabled={!isTransportProvider || !canLoadStops || isStopsLoading}
          isLoading={isStopsLoading}
          onSelect={handleStopSelect}
        />

        {recentItems.length > 0 && (
          <>
            <MenuLabel>Recent Stops</MenuLabel>
            {recentItems.map((item) => (
              <MenuItem
                key={item.key}
                Icon={<GoogleIcon.PinDrop className="size-4" />}
                Body={item.title}
                desc={item.subtitle}
                onClick={() => handleStopSelect(item.value)}
              >
                {item.badge && (
                  <MenuItemAction>
                    <span className="text-xs text-secondary">{item.badge}</span>
                  </MenuItemAction>
                )}
              </MenuItem>
            ))}
          </>
        )}
      </MenuGroup>
    </>
  );
}

function getTransportProvider(
  activeAdapter: string,
): MapServerTransportProviderId {
  return isMapServerTransportProvider(activeAdapter)
    ? activeAdapter
    : "transit";
}

function toStopSearchItem(stop: RouteStop): TransitSearchItem<RouteStop> {
  return {
    value: stop,
    key: stop.id,
    title: stop.stopName || stop.stopId,
    subtitle: stop.id,
    badge: stop.routeShortNames[0] ?? null,
    searchText: [stop.stopName, stop.stopId, ...stop.routeShortNames].join(" "),
  };
}
