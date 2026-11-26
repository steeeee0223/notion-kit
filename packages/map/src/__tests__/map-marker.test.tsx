import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  MapMarker,
  MapMarkerContent,
  type MapMarkerProps,
} from "../map-marker";
import { MapContext } from "../use-map";

it("MapMarker_ClickCallbackChanges_KeepsOneListenerOnTheSameMarker", () => {
  const firstClick = vi.fn();
  const latestClick = vi.fn();
  const contentRef = createRef<HTMLSpanElement>();
  function marker(onClick: MapMarkerProps["onClick"]) {
    return (
      <MapContext value={{ map: null, isLoaded: false }}>
        <MapMarker longitude={121.54} latitude={25.05} onClick={onClick}>
          <MapMarkerContent>
            <span ref={contentRef}>Marker content</span>
          </MapMarkerContent>
        </MapMarker>
      </MapContext>
    );
  }
  const { rerender, unmount } = render(marker(firstClick), {
    reactStrictMode: true,
  });
  const content = contentRef.current;
  const element = content?.closest('[data-slot="map-marker"]');
  if (!content || !element) throw new Error("Missing map marker");

  rerender(marker(latestClick));

  expect(contentRef.current).toBe(content);
  fireEvent.click(content);
  expect(firstClick).not.toHaveBeenCalled();
  expect(latestClick).toHaveBeenCalledTimes(1);

  unmount();
  fireEvent.click(element);
  expect(latestClick).toHaveBeenCalledTimes(1);
});
