import { createFileRoute } from "@tanstack/react-router";

import { Map } from "@notion-kit/map";

import { LayerSidebar } from "@/components/layer-sidebar";
import { MapToolbar } from "@/components/map-toobar";
import { MapViewportBridge } from "@/components/map-viewport-bridge";
import { useLayerStore } from "@/lib/layer-registry";
import { useWs } from "@/lib/use-ws";

// Initialize plugins
import "@/plugins/routes";
import "@/plugins/stops";
import "@/plugins/vehicles";

import { MyLocation } from "@/components/my-location";
import { RouteDetailsSheet } from "@/plugins/routes/route-details-sheet";
import { StopDeparturesSheet } from "@/plugins/stops/stop-departures-sheet";

export const Route = createFileRoute("/")({
  component: MapPage,
});

function MapPage() {
  const plugins = useLayerStore((state) => state.plugins);
  useWs();

  return (
    <div className="relative size-full">
      <Map center={[19.04, 47.497]} zoom={12} theme="dark">
        <MapViewportBridge />
        <MyLocation />
        <MapToolbar />
        {Array.from(plugins.values()).map((plugin) => {
          if (!plugin.enabled) return null;
          return <plugin.MapLayer key={`layer-${plugin.id}`} />;
        })}
      </Map>

      <div className="absolute top-4 left-4 z-10 mx-4">
        <LayerSidebar />
      </div>

      <StopDeparturesSheet />
      <RouteDetailsSheet />
    </div>
  );
}
