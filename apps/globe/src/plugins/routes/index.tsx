import * as GoogleIcon from "@/components/google-icons";
import { useLayerStore } from "@/lib/layer-registry";

import { RoutesLayer } from "./routes-layer";
import { RoutesPanel } from "./routes-panel";

// Auto-register plugin when imported
useLayerStore.getState().register({
  id: "routes",
  name: "Routes",
  icon: <GoogleIcon.Route className="size-4 fill-primary" />,
  MapLayer: RoutesLayer,
  PanelContent: RoutesPanel,
  defaultEnabled: true,
});
