import {
  MapCompass,
  MapControlGroup,
  MapControls,
  MapFullScreen,
  MapLocate,
  MapViewModeToggle,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";
import { Separator } from "@notion-kit/ui/primitives";

export function MapToolbar() {
  return (
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
  );
}
