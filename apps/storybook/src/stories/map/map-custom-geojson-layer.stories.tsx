import { useCallback, useEffect, useState } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import {
  Map,
  MapControlGroup,
  MapControls,
  MapZoomIn,
  MapZoomOut,
  useMap,
} from "@notion-kit/map";
import { Button } from "@notion-kit/ui/primitives";

const meta = {
  title: "Map/Custom GeoJSON Layer",
  parameters: { layout: "fullscreen" },
  decorators: (Story) => (
    <div className="h-125 w-full">
      <Map center={[121.525, 25.037]} zoom={13}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
          </MapControlGroup>
        </MapControls>
        <Story />
      </Map>
    </div>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface ParkProperties {
  name: string;
  type: string;
}

const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Daan Forest Park", type: "park" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [121.5321, 25.0347],
            [121.5379, 25.0345],
            [121.538, 25.0291],
            [121.5322, 25.0293],
            [121.5321, 25.0347],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "228 Peace Park", type: "park" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [121.5138, 25.0439],
            [121.5172, 25.044],
            [121.5173, 25.0415],
            [121.514, 25.0414],
            [121.5138, 25.0439],
          ],
        ],
      },
    },
  ],
} satisfies GeoJSON.FeatureCollection<GeoJSON.Polygon, ParkProperties>;

function CustomGeoJsonLayer() {
  const { map, isLoaded } = useMap();
  const [isLayerVisible, setIsLayerVisible] = useState(false);
  const [hoveredPark, setHoveredPark] = useState<string | null>(null);

  const addLayers = useCallback(() => {
    if (!map) return;

    if (!map.getSource("parks")) {
      map.addSource("parks", {
        type: "geojson",
        data: geojsonData,
      });
    }

    if (!map.getLayer("parks-fill")) {
      map.addLayer({
        id: "parks-fill",
        type: "fill",
        source: "parks",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.4,
        },
        layout: {
          visibility: isLayerVisible ? "visible" : "none",
        },
      });
    }

    if (!map.getLayer("parks-outline")) {
      map.addLayer({
        id: "parks-outline",
        type: "line",
        source: "parks",
        paint: {
          "line-color": "#16a34a",
          "line-width": 2,
        },
        layout: {
          visibility: isLayerVisible ? "visible" : "none",
        },
      });
    }
  }, [isLayerVisible, map]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    addLayers();

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredPark(null);
    };
    const handleMouseMove = (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["parks-fill"],
      });
      setHoveredPark(features[0]?.properties?.name ?? null);
    };

    map.on("mouseenter", "parks-fill", handleMouseEnter);
    map.on("mouseleave", "parks-fill", handleMouseLeave);
    map.on("mousemove", "parks-fill", handleMouseMove);

    return () => {
      map.off("mouseenter", "parks-fill", handleMouseEnter);
      map.off("mouseleave", "parks-fill", handleMouseLeave);
      map.off("mousemove", "parks-fill", handleMouseMove);
      try {
        if (map.getLayer("parks-outline")) map.removeLayer("parks-outline");
        if (map.getLayer("parks-fill")) map.removeLayer("parks-fill");
        if (map.getSource("parks")) map.removeSource("parks");
      } catch {
        // Ignore cleanup errors from style reloads.
      }
    };
  }, [addLayers, isLoaded, map]);

  const toggleLayer = () => {
    if (!map) return;

    const visibility = isLayerVisible ? "none" : "visible";
    if (map.getLayer("parks-fill")) {
      map.setLayoutProperty("parks-fill", "visibility", visibility);
    }
    if (map.getLayer("parks-outline")) {
      map.setLayoutProperty("parks-outline", "visibility", visibility);
    }
    setIsLayerVisible((visible) => !visible);
  };

  return (
    <>
      <div className="absolute top-3 left-3 z-10">
        <Button
          size="sm"
          variant={isLayerVisible ? "primary" : "white"}
          onClick={toggleLayer}
        >
          {isLayerVisible ? "Hide parks" : "Show parks"}
        </Button>
      </div>
      {hoveredPark && (
        <div className="absolute bottom-3 left-3 z-10 rounded-md border bg-main/90 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur">
          {hoveredPark}
        </div>
      )}
    </>
  );
}

export const ParksLayer: Story = {
  render: () => <CustomGeoJsonLayer />,
};
