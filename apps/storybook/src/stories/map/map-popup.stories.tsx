import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Map, MapControls, MapPopup, useMap } from "@notion-kit/map";

const meta = {
  title: "Map/Popup",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121.5654, 25.033]} zoom={13}>
        <MapControls />
        <MapPopup longitude={121.5654} latitude={25.033} closeButton>
          <div className="min-w-36">
            <p className="font-semibold">Taipei 101</p>
            <p className="text-xs text-muted">
              One of the tallest buildings in the world
            </p>
          </div>
        </MapPopup>
      </Map>
    </div>
  ),
};

function ClickPopupInner() {
  const { map, isLoaded } = useMap();
  const [popup, setPopup] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  if (map && isLoaded) {
    map.on("click", (e) => {
      setPopup({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });
  }

  return popup ? (
    <MapPopup
      longitude={popup.lng}
      latitude={popup.lat}
      closeButton
      onClose={() => setPopup(null)}
    >
      <div className="min-w-24">
        <p className="text-xs font-medium">Clicked at</p>
        <p className="font-mono text-xs text-muted">
          {popup.lng.toFixed(4)}, {popup.lat.toFixed(4)}
        </p>
      </div>
    </MapPopup>
  ) : null;
}

export const ClickToOpen: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121.5654, 25.033]} zoom={13}>
        <MapControls />
        <ClickPopupInner />
      </Map>
    </div>
  ),
};
