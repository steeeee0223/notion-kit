import { use } from "react";

import { MapContext } from "./map";

export function useMap() {
  return use(MapContext);
}
