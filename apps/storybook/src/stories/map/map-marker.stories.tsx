import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Icon } from "@notion-kit/icons";
import {
  Map,
  MapControlGroup,
  MapControls,
  MapMarker,
  MapMarkerContent,
  MapMarkerLabel,
  MapMarkerPopup,
  MapMarkerTooltip,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";
import { Badge } from "@notion-kit/ui/primitives";

const meta = {
  title: "Map/Map Marker",
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
    <MapMarker longitude={121.5654} latitude={25.033}>
      <MapMarkerContent />
    </MapMarker>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <>
      <MapMarker longitude={121.5654} latitude={25.033}>
        <MapMarkerContent>
          <div className="flex size-6 items-center justify-center rounded-full bg-red-500 shadow-lg">
            <Icon.Pin className="size-4 fill-white" />
          </div>
        </MapMarkerContent>
      </MapMarker>
      <MapMarker longitude={121.568} latitude={25.036}>
        <MapMarkerContent>
          <div className="flex size-6 items-center justify-center rounded-full bg-amber-500 shadow-lg">
            <Icon.Star className="size-4 fill-white" />
          </div>
        </MapMarkerContent>
      </MapMarker>
    </>
  ),
};

export const WithPopup: Story = {
  render: () => (
    <MapMarker longitude={121.5654} latitude={25.033}>
      <MapMarkerContent />
      <MapMarkerPopup closeButton className="min-w-36">
        <p className="font-semibold">Taipei 101</p>
        <p className="text-xs text-muted">Iconic 101-floor skyscraper</p>
      </MapMarkerPopup>
    </MapMarker>
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <MapMarker longitude={121.5654} latitude={25.033}>
      <MapMarkerContent>
        <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <Icon.Pin className="size-4 fill-white" />
        </div>
      </MapMarkerContent>
      <MapMarkerTooltip>Hover tooltip</MapMarkerTooltip>
    </MapMarker>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <>
      <MapMarker longitude={121.5654} latitude={25.033}>
        <MapMarkerContent>
          <MapMarkerLabel>Taipei 101</MapMarkerLabel>
          <div className="size-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
        </MapMarkerContent>
      </MapMarker>
      <MapMarker longitude={121.568} latitude={25.036}>
        <MapMarkerContent>
          <div className="size-4 rounded-full border-2 border-white bg-green-500 shadow-lg" />
          <MapMarkerLabel position="bottom">Xinyi District</MapMarkerLabel>
        </MapMarkerContent>
      </MapMarker>
    </>
  ),
};

export const Draggable: Story = {
  render: function DraggableStory() {
    const [position, setPosition] = useState({ lng: 121.5654, lat: 25.033 });

    return (
      <>
        <MapMarker
          longitude={position.lng}
          latitude={position.lat}
          draggable
          onDragEnd={(lngLat) => setPosition(lngLat)}
        >
          <MapMarkerContent>
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 shadow-lg ring-2 ring-blue-300">
              <Icon.Pin className="size-4 fill-white" />
              <MapMarkerLabel position="top">
                <Badge variant="tag">
                  {position.lng.toFixed(4)}, {position.lat.toFixed(4)}
                </Badge>
              </MapMarkerLabel>
            </div>
          </MapMarkerContent>
          <MapMarkerTooltip>Drag me!</MapMarkerTooltip>
        </MapMarker>
      </>
    );
  },
};

const locations = [
  {
    name: "Taipei 101",
    lng: 121.5654,
    lat: 25.033,
    desc: "Iconic skyscraper",
  },
  {
    name: "Longshan Temple",
    lng: 121.4998,
    lat: 25.0372,
    desc: "Historic temple",
  },
  {
    name: "Shilin Night Market",
    lng: 121.5248,
    lat: 25.0881,
    desc: "Famous night market",
  },
  {
    name: "National Palace Museum",
    lng: 121.5486,
    lat: 25.1024,
    desc: "World-class museum",
  },
];

export const MultipleMarkers: Story = {
  render: () => (
    <>
      {locations.map((loc) => (
        <MapMarker key={loc.name} longitude={loc.lng} latitude={loc.lat}>
          <MapMarkerContent>
            <MapMarkerLabel>{loc.name}</MapMarkerLabel>
            <div className="size-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
          </MapMarkerContent>
          <MapMarkerPopup closeButton className="min-w-36">
            <p className="font-semibold">{loc.name}</p>
            <p className="text-xs text-muted">{loc.desc}</p>
          </MapMarkerPopup>
        </MapMarker>
      ))}
    </>
  ),
};
