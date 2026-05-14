"use client";

import { Map } from "@notion-kit/map";

export default function MapDefault() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-md border">
      <Map center={[121.5654, 25.033]} zoom={12} />
    </div>
  );
}
