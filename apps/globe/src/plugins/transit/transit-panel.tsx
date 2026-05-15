import { useMemo } from "react";
import { create } from "zustand";

import { cn } from "@notion-kit/cn";
import { MenuGroup, MenuItem, MenuItemAction } from "@notion-kit/ui/primitives";

import { VehicleType } from "@/lib/types";
import { useVehiclePositions } from "@/plugins/transit/use-vehicle-positions";
import { VehicleIconPreview } from "@/plugins/transit/vehicle-icon";

interface TransitFilterState {
  hiddenTypes: Set<string>;
  toggleType: (type: string) => void;
}

export const useTransitFilter = create<TransitFilterState>((set) => ({
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

export function TransitPanel() {
  const { data: vehicles = [] } = useVehiclePositions();
  const { hiddenTypes, toggleType } = useTransitFilter();

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
      <div className="mb-1 text-xs font-medium text-secondary">
        Active Vehicles: {activeVehicles.length}
      </div>

      <MenuGroup>
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
    </div>
  );
}
