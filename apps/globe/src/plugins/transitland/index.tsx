import { TramFront } from "lucide-react";

import { useLayerStore } from "@/lib/layer-registry";
import { TransitLayer } from "@/plugins/transitland/transit-layer";
import { TransitPanel } from "@/plugins/transitland/transit-panel";

// Auto-register plugin when imported
useLayerStore.getState().register({
  id: "transitland",
  name: "Transitland Global",
  icon: <TramFront className="size-4" />,
  MapLayer: TransitLayer,
  PanelContent: TransitPanel,
  defaultEnabled: false,
});
