import { MeterBar, MeterRing, MeterValue } from "@notion-kit/ui/primitives";
import { COLOR } from "@notion-kit/utils";

export function BarExample() {
  return (
    <MeterBar
      value={60}
      trackColor={COLOR.blue.hex}
      format={{
        style: "currency",
        currency: "USD",
      }}
      className="w-40 gap-2"
    >
      <MeterValue className="text-xs" />
    </MeterBar>
  );
}

export function RingExample() {
  return (
    <MeterRing
      value={60}
      trackColor={COLOR.yellow.hex}
      className="w-20 items-center gap-2"
    >
      <MeterValue className="text-xs" />
    </MeterRing>
  );
}
