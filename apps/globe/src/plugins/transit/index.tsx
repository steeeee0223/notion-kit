import { BusFront } from "lucide-react";

import { useLayerStore } from "@/lib/layer-registry";
import { TransitLayer } from "@/plugins/transit/transit-layer";
import { TransitPanel } from "@/plugins/transit/transit-panel";

// Auto-register plugin when imported
useLayerStore.getState().register({
  id: "transit",
  name: "BKK Public Transit",
  icon: <BusFront className="size-4" />,
  MapLayer: TransitLayer,
  PanelContent: TransitPanel,
  defaultEnabled: true,
});
