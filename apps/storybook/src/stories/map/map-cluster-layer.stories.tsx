import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import {
  Map,
  MapClusterLayer,
  MapControlGroup,
  MapControls,
  MapPopup,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";

const meta = {
  title: "Map/Map Cluster Layer",
  parameters: { layout: "fullscreen" },
  decorators: (Story) => (
    <div className="h-125 w-full">
      <Map center={[121.54, 25.05]} zoom={11}>
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

interface PointProperties {
  name: string;
  category: string;
}

function generateTaipeiPoints(
  count: number,
): GeoJSON.FeatureCollection<GeoJSON.Point, PointProperties> {
  const center = { lng: 121.54, lat: 25.05 };
  const categories = ["Restaurant", "Cafe", "Bar", "Shop", "Hotel"];
  const features: GeoJSON.Feature<GeoJSON.Point, PointProperties>[] = [];

  for (let i = 0; i < count; i++) {
    const lng = center.lng + (Math.random() - 0.5) * 0.15;
    const lat = center.lat + (Math.random() - 0.5) * 0.1;
    features.push({
      type: "Feature",
      properties: {
        name: `Location ${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)]!,
      },
      geometry: { type: "Point", coordinates: [lng, lat] },
    });
  }

  return { type: "FeatureCollection", features };
}

const pointsData = generateTaipeiPoints(300);

export const Default: Story = {
  render: () => <MapClusterLayer data={pointsData} />,
};

export const CustomColors: Story = {
  render: () => (
    <MapClusterLayer
      data={pointsData}
      clusterColors={["#8b5cf6", "#ec4899", "#ef4444"]}
      pointColor="#a855f7"
      clusterThresholds={[50, 200]}
    />
  ),
};

export const WithPointClick: Story = {
  render: function PointClickStory() {
    const [selected, setSelected] = useState<{
      name: string;
      category: string;
      coordinates: [number, number];
    } | null>(null);

    return (
      <>
        <MapClusterLayer
          data={pointsData}
          onPointClick={(feature, coordinates) =>
            setSelected({
              name: feature.properties.name,
              category: feature.properties.category,
              coordinates,
            })
          }
        />
        {selected && (
          <MapPopup
            longitude={selected.coordinates[0]}
            latitude={selected.coordinates[1]}
            onClose={() => setSelected(null)}
            closeButton
          >
            <div className="min-w-24">
              <p className="font-medium">{selected.name}</p>
              <p className="text-xs text-muted">{selected.category}</p>
            </div>
          </MapPopup>
        )}
      </>
    );
  },
};
