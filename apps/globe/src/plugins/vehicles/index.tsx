import { BusFront } from "lucide-react";

import { useLayerStore } from "@/lib/layer-registry";
import { VehiclesLayer } from "./vehicles-layer";
import { VehiclesPanel } from "./vehicles-panel";

// Auto-register plugin when imported
useLayerStore.getState().register({
  id: "vehicles",
  name: "Vehicles",
  icon: <BusFront className="size-4" />,
  MapLayer: VehiclesLayer,
  PanelContent: VehiclesPanel,
  defaultEnabled: true,
});
