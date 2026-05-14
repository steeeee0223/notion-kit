import type { Meta, StoryObj } from "storybook-react-rsbuild";

import {
  Map,
  MapCompass,
  MapControlGroup,
  MapControls,
  MapFullScreen,
  MapLocate,
  MapMarker,
  MapMarkerContent,
  MapViewModeToggle,
  MapZoomIn,
  MapZoomOut,
  useCurrentLocation,
} from "@notion-kit/map";
import { Separator } from "@notion-kit/ui/primitives";

const initialLocation = {
  lon: 121.5654,
  lat: 25.033,
};

const meta = {
  title: "Map/Map Controls",
  parameters: { layout: "fullscreen" },
  decorators: (Story) => {
    const { coordinates } = useCurrentLocation();
    const coord = coordinates
      ? { lon: coordinates[0], lat: coordinates[1] }
      : initialLocation;

    return (
      <div className="h-125 w-full">
        <Map center={initialLocation} zoom={12}>
          <MapMarker longitude={coord.lon} latitude={coord.lat}>
            <MapMarkerContent />
          </MapMarker>
          <Story />
        </Map>
      </div>
    );
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllControls: Story = {
  render: () => (
    <MapControls>
      <MapControlGroup>
        <MapZoomIn />
        <MapZoomOut />
        <Separator />
        <MapLocate />
        <MapViewModeToggle />
        <MapCompass />
        <MapFullScreen />
      </MapControlGroup>
    </MapControls>
  ),
};
