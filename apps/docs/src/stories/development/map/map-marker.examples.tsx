import { useState } from "react";
import type { ReactNode } from "react";

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

const ExampleLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-125 w-full">
    <Map center={[121.5654, 25.033]} zoom={13}>
      <MapControls>
        <MapControlGroup>
          <MapZoomIn />
          <MapZoomOut />
        </MapControlGroup>
      </MapControls>
      {children}
    </Map>
  </div>
);

const DefaultContent = () => {
  return (
    <MapMarker longitude={121.5654} latitude={25.033}>
      <MapMarkerContent />
    </MapMarker>
  );
};

export function DefaultExample() {
  return (
    <ExampleLayout>
      <DefaultContent />
    </ExampleLayout>
  );
}

const CustomContentContent = () => {
  return (
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
  );
};

export function CustomContentExample() {
  return (
    <ExampleLayout>
      <CustomContentContent />
    </ExampleLayout>
  );
}

const WithPopupContent = () => {
  return (
    <MapMarker longitude={121.5654} latitude={25.033}>
      <MapMarkerContent />
      <MapMarkerPopup closeButton className="min-w-36">
        <p className="font-semibold">Taipei 101</p>
        <p className="text-xs text-muted">Iconic 101-floor skyscraper</p>
      </MapMarkerPopup>
    </MapMarker>
  );
};

export function WithPopupExample() {
  return (
    <ExampleLayout>
      <WithPopupContent />
    </ExampleLayout>
  );
}

const WithTooltipContent = () => {
  return (
    <MapMarker longitude={121.5654} latitude={25.033}>
      <MapMarkerContent>
        <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <Icon.Pin className="size-4 fill-white" />
        </div>
      </MapMarkerContent>
      <MapMarkerTooltip>Hover tooltip</MapMarkerTooltip>
    </MapMarker>
  );
};

export function WithTooltipExample() {
  return (
    <ExampleLayout>
      <WithTooltipContent />
    </ExampleLayout>
  );
}

const WithLabelContent = () => {
  return (
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
  );
};

export function WithLabelExample() {
  return (
    <ExampleLayout>
      <WithLabelContent />
    </ExampleLayout>
  );
}

const DraggableContent = () => {
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
};

export function DraggableExample() {
  return (
    <ExampleLayout>
      <DraggableContent />
    </ExampleLayout>
  );
}
