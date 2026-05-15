import { MenuGroup, MenuItem, MenuLabel } from "@notion-kit/ui/primitives";

import { useAdapterBBoxStore } from "@/adapters";
import * as GoogleIcon from "@/components/google-icons";

export function QuickLocations() {
  const requestFlyTo = useAdapterBBoxStore((state) => state.requestFlyTo);

  return (
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
          Body={loc.name}
          Icon={<GoogleIcon.LocationOn className="size-4" />}
          onClick={() => requestFlyTo(loc.coords)}
        />
      ))}
    </MenuGroup>
  );
}
