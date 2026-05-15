import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuLabel,
} from "@notion-kit/ui/primitives";

import { useAdapterBBoxStore, useAdapterStore } from "@/adapters";
import {
  isUsableStaticFeed,
  useFeedRoutes,
  useStaticFeedStatus,
  type TransitRoute,
} from "@/adapters/transitland/use-static-feeds";
import * as GoogleIcon from "@/components/google-icons";
import { syncStaticTransitData } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";
import {
  TransitEntitySearch,
  TransitStaticFeed,
  type TransitSearchItem,
} from "@/plugins/common";

import { useRouteStore } from "./store";

export function RoutesPanel() {
  const queryClient = useQueryClient();
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);
  const bbox = useAdapterBBoxStore((state) => state.bbox);
  const selectedFeed = useRouteStore((state) => state.selectedFeed);
  const setSelectedFeed = useRouteStore((state) => state.setSelectedFeed);
  const recentRoutes = useRouteStore((state) => state.recentRoutes);
  const pushRecentRoute = useRouteStore((state) => state.pushRecentRoute);
  const setMapRouteContext = useRouteStore((state) => state.setMapRouteContext);
  const setSelectedRouteContext = useRouteStore(
    (state) => state.setSelectedRouteContext,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isTransitland = activeAdapter === "transitland";

  const {
    data: candidates = [],
    isLoading: isFeedLoading,
    error: feedError,
  } = useStaticFeedStatus(bbox, isTransitland, (data) => data.candidates);

  const canLoadRoutes = isUsableStaticFeed(selectedFeed);
  const { data: routeItems = [], isLoading: isRoutesLoading } = useFeedRoutes(
    selectedFeed?.feedOnestopId ?? null,
    isTransitland && canLoadRoutes,
    (data) => data.routes.map(toRouteSearchItem),
  );

  const recentItems = useMemo(
    () => recentRoutes.map(toRouteSearchItem),
    [recentRoutes],
  );

  async function handleSync() {
    if (!bbox && !selectedFeed) {
      setMessage("Move the map before syncing feed.");
      return;
    }
    setIsSyncing(true);
    try {
      const result = await syncStaticTransitData(
        selectedFeed ? { feedIds: [selectedFeed.feedLookupKey] } : { bbox },
      );
      const routesCount = result.synced.reduce(
        (total, feed) => total + feed.routesCount,
        0,
      );
      setMessage(`Feed sync finished: ${routesCount} routes synced.`);
      await queryClient.invalidateQueries({
        queryKey: queryKey.mapServer.staticFeedStatus(bbox),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKey.mapServer.routes(
          selectedFeed?.feedOnestopId ?? null,
        ),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Feed sync failed.");
    } finally {
      setIsSyncing(false);
    }
  }

  function handleRouteSelect(route: TransitRoute) {
    pushRecentRoute(route);
    setSelectedRouteContext(null);
    setMapRouteContext({
      routeId: route.id,
      routeColor: route.route_color,
      routeShortName: route.route_short_name,
      routeLongName: route.route_long_name,
      agencyName: route.agency_name,
      fitBounds: true,
    });
  }

  return (
    <>
      <TransitStaticFeed
        bbox={bbox}
        candidates={candidates}
        error={feedError}
        isLoading={isFeedLoading}
        isSyncing={isSyncing}
        isTransitland={isTransitland}
        message={message}
        selectedFeed={selectedFeed}
        onSelectFeed={setSelectedFeed}
        onSync={handleSync}
      />
      <MenuGroup>
        <TransitEntitySearch
          label="Search routes"
          placeholder="Search routes..."
          items={routeItems}
          recentItems={recentItems}
          disabled={!isTransitland || !canLoadRoutes || isRoutesLoading}
          isLoading={isRoutesLoading}
          onSelect={handleRouteSelect}
        />

        {recentItems.length > 0 && (
          <>
            <MenuLabel>Recent Routes</MenuLabel>
            {recentItems.map((item) => (
              <MenuItem
                key={item.key}
                Icon={<GoogleIcon.Route className="size-4" />}
                Body={<div className="truncate">{item.title}</div>}
                desc={item.subtitle}
                onClick={() => handleRouteSelect(item.value)}
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

function toRouteSearchItem(
  route: TransitRoute,
): TransitSearchItem<TransitRoute> {
  const title = [route.route_short_name, route.route_long_name]
    .filter(Boolean)
    .join(" · ");
  return {
    value: route,
    key: route.id,
    title: title || route.route_id,
    subtitle: route.agency_name ?? "",
    badge: route.route_short_name ?? route.route_id,
    color: route.route_color,
    searchText: [
      route.route_short_name,
      route.route_long_name,
      route.route_id,
      route.agency_name,
      route.feed_onestop_id,
    ]
      .filter(Boolean)
      .join(" "),
  };
}
