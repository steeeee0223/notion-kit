import { Route } from "lucide-react";

import { useLayerStore } from "@/lib/layer-registry";

import { RoutesLayer } from "./routes-layer";

// Auto-register plugin when imported
useLayerStore.getState().register({
  id: "routes",
  name: "Routes",
  icon: <Route className="size-4" />,
  MapLayer: RoutesLayer,
  defaultEnabled: true,
});
