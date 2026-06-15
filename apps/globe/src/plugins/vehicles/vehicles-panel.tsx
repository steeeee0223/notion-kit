import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { create } from "zustand";

import { cn } from "@notion-kit/cn";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuLabel,
} from "@notion-kit/ui/primitives";

import {
  useActiveVehiclePositions,
  useAdapterBBoxStore,
  useAdapterStore,
} from "@/adapters";
import { useVehicleDiagnosticsStore } from "@/adapters/transitland/use-vehicle-positions";
import * as GoogleIcon from "@/components/google-icons";
import { syncRealtimeSnapshots } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";
import {
  isMapServerTransportProvider,
  type MapServerTransportProviderId,
} from "@/lib/transport-provider";
import { VehicleType } from "@/lib/types";

import { VehicleIconPreview } from "./vehicle-icon";

interface TransitFilterState {
  hiddenTypes: Set<string>;
  toggleType: (type: string) => void;
}

export const useVehicleFilter = create<TransitFilterState>((set) => ({
  hiddenTypes: new Set(),
  toggleType: (type) =>
    set((state) => {
      const newSet = new Set(state.hiddenTypes);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return { hiddenTypes: newSet };
    }),
}));

export function VehiclesPanel() {
  const queryClient = useQueryClient();
  const { data: vehicles = [] } = useActiveVehiclePositions();
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);
  const { hiddenTypes, toggleType } = useVehicleFilter();
  const bbox = useAdapterBBoxStore((state) => state.bbox);
  const message = useVehicleDiagnosticsStore((state) => state.message);
  const autoSyncMessage = useVehicleDiagnosticsStore(
    (state) => state.autoSyncMessage,
  );
  const setAutoSyncMessage = useVehicleDiagnosticsStore(
    (state) => state.setAutoSyncMessage,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const transportProvider = getTransportProvider(activeAdapter);
  const canSyncRealtime = isMapServerTransportProvider(activeAdapter);

  const activeVehicles = vehicles.filter((v) => !v.stale);

  // Count by type
  const counts = useMemo(() => {
    const res: Record<string, number> = {};
    for (const v of activeVehicles) {
      res[v.vehicleType] = (res[v.vehicleType] ?? 0) + 1;
    }
    return res;
  }, [activeVehicles]);

  const types = Object.keys(counts).sort(
    (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0),
  ) as VehicleType[];

  async function handleSyncRealtime() {
    if (!bbox) {
      setAutoSyncMessage("Move the map before syncing this region.");
      return;
    }
    setIsSyncing(true);
    try {
      const realtimeSync = await syncRealtimeSnapshots({
        bbox,
        provider: transportProvider,
      });
      const syncedFeeds =
        realtimeSync.polled ??
        realtimeSync.synced?.map((feed) => ({
          feedOnestopId: feed.feedOnestopId,
          vehiclePositionsCount: feed.vehiclesCount,
        })) ??
        [];
      const vehiclePositionsCount = syncedFeeds.reduce(
        (total, feed) => total + feed.vehiclePositionsCount,
        0,
      );
      setAutoSyncMessage(
        realtimeSync.meta?.message ??
          `Vehicle sync finished: ${vehiclePositionsCount} vehicle positions from ${syncedFeeds.length} realtime feeds.`,
      );
      await queryClient.invalidateQueries({
        queryKey: queryKey.mapServer.vehicles(transportProvider, bbox),
      });
    } catch (error) {
      setAutoSyncMessage(
        error instanceof Error ? error.message : "Region sync failed.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <MenuGroup>
        <MenuLabel title="Active Vehicles" />
        {(message ?? autoSyncMessage) && (
          <div className="mx-1 mb-1 flex flex-col gap-2 rounded-md border border-default/15 bg-default/5 p-2 text-xs text-secondary">
            {message && (
              <div className="flex gap-1.5">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-yellow-600" />
                <span>{message}</span>
              </div>
            )}
            {autoSyncMessage && (
              <div className="text-muted">{autoSyncMessage}</div>
            )}
          </div>
        )}
        <MenuItem
          icon={
            <GoogleIcon.Sync
              className={cn("size-3.5", isSyncing && "animate-spin")}
            />
          }
          label="Sync vehicles"
          data-disabled={!canSyncRealtime || isSyncing}
          onClick={handleSyncRealtime}
        />
        {types.map((type) => (
          <MenuItem
            key={type}
            label={
              <div className={cn(hiddenTypes.has(type) && "text-muted")}>
                {type}
              </div>
            }
            icon={<VehicleIconPreview type={type} />}
            onClick={() => toggleType(type)}
          >
            <MenuItemAction className="flex items-center gap-1.5">
              <span className="text-xs text-secondary">{counts[type]}</span>
            </MenuItemAction>
          </MenuItem>
        ))}
      </MenuGroup>
    </div>
  );
}

function getTransportProvider(
  activeAdapter: string,
): MapServerTransportProviderId {
  return isMapServerTransportProvider(activeAdapter)
    ? activeAdapter
    : "transit";
}
