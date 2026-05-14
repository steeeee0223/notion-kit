"use client";

import {
  Map,
  MapClusterLayer,
  MapControlGroup,
  MapControls,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";

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

export default function MapClusterLayerDemo() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-md border">
      <Map center={[121.54, 25.05]} zoom={11}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
          </MapControlGroup>
        </MapControls>
        <MapClusterLayer data={pointsData} />
      </Map>
    </div>
  );
}
