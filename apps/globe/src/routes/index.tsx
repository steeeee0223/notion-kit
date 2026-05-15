import { createFileRoute } from "@tanstack/react-router";

import { Map } from "@notion-kit/map";

import { LayerSidebar } from "@/components/layer-sidebar";
import { MapToolbar } from "@/components/map-toobar";
import { useLayerStore } from "@/lib/layer-registry";
import { useWs } from "@/lib/use-ws";

// Initialize plugins
import "@/plugins/transit";

export const Route = createFileRoute("/")({
  component: MapPage,
});

function MapPage() {
  const plugins = useLayerStore((state) => state.plugins);
  useWs();

  return (
    <div className="relative size-full">
      <Map center={[19.04, 47.497]} zoom={12} theme="dark">
        <MapToolbar />
        {Array.from(plugins.values()).map((plugin) => {
          if (!plugin.enabled) return null;
          return <plugin.MapLayer key={`layer-${plugin.id}`} />;
        })}
      </Map>

      <div className="absolute top-4 left-4 z-10 w-80">
        <LayerSidebar />
      </div>
    </div>
  );
}
