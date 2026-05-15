import * as GoogleIcon from "@/components/google-icons";
import { useLayerStore } from "@/lib/layer-registry";

import { StopsLayer } from "./stops-layer";
import { StopsPanel } from "./stops-panel";

useLayerStore.getState().register({
  id: "stops",
  name: "Stops",
  icon: <GoogleIcon.PinDrop className="size-4 fill-primary" />,
  MapLayer: StopsLayer,
  PanelContent: StopsPanel,
  defaultEnabled: true,
});
