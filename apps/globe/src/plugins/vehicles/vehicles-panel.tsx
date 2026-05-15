import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { create } from "zustand";

import { cn } from "@notion-kit/cn";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuLabel,
} from "@notion-kit/ui/primitives";

import { useActiveVehiclePositions, useAdapterBBoxStore } from "@/adapters";
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
  const { data: vehicles = [] } = useActiveVehiclePositions();
  const { hiddenTypes, toggleType } = useVehicleFilter();
  const requestFlyTo = useAdapterBBoxStore((state) => state.requestFlyTo);

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

  return (
    <div className="flex flex-col gap-2">
      <MenuGroup>
        <MenuLabel>Active Vehicles</MenuLabel>
        {types.map((type) => (
          <MenuItem
            key={type}
            Body={
              <div className={cn(hiddenTypes.has(type) && "text-muted")}>
                {type}
              </div>
            }
            Icon={<VehicleIconPreview type={type} />}
            onClick={() => toggleType(type)}
          >
            <MenuItemAction className="flex items-center gap-1.5">
              <span className="text-xs text-secondary">{counts[type]}</span>
            </MenuItemAction>
          </MenuItem>
        ))}
      </MenuGroup>

      <MenuGroup>
        <MenuLabel>Quick Locations</MenuLabel>
        {[
          {
            name: "Budapest, HU",
            coords: [19.0402, 47.4979] as [number, number],
          },
          {
            name: "San Francisco, US",
            coords: [-122.4194, 37.7749] as [number, number],
          },
          {
            name: "Edmonton, CA",
            coords: [-113.4938, 53.5461] as [number, number],
          },
        ].map((loc) => (
          <MenuItem
            key={loc.name}
            Body={<div>{loc.name}</div>}
            Icon={<MapPin className="size-4 text-red" />}
            onClick={() => requestFlyTo(loc.coords)}
          />
        ))}
      </MenuGroup>
    </div>
  );
}
