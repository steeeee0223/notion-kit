import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import {
  Map,
  MapControlGroup,
  MapControls,
  MapPopup,
  MapZoomIn,
  MapZoomOut,
  useMap,
} from "@notion-kit/map";

const meta = {
  title: "Map/Map Popup",
  parameters: { layout: "fullscreen" },
  decorators: (Story) => (
    <div className="h-125 w-full">
      <Map center={[121.5654, 25.033]} zoom={13}>
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

export const Default: Story = {
  render: () => (
    <MapPopup longitude={121.5654} latitude={25.033} closeButton>
      <div className="min-w-36">
        <p className="font-semibold">Taipei 101</p>
        <p className="text-xs text-muted">
          One of the tallest buildings in the world
        </p>
      </div>
    </MapPopup>
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
  render: () => <ClickPopupInner />,
};
