import { MapPinned } from "lucide-react";

import { useLayerStore } from "@/lib/layer-registry";

import { StopsLayer } from "./stops-layer";

useLayerStore.getState().register({
  id: "stops",
  name: "Stops",
  icon: <MapPinned className="size-4" />,
  MapLayer: StopsLayer,
  defaultEnabled: true,
});
