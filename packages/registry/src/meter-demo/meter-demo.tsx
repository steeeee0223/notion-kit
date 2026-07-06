import {
  MeterBar,
  MeterLabel,
  MeterRing,
  MeterValue,
} from "@notion-kit/ui/primitives";

export default function Demo() {
  return (
    <div className="flex w-50 max-w-full flex-col gap-5">
      <div className="space-y-2">
        <MeterBar
          value={72}
          trackColor="#2383e2"
          className="flex flex-col gap-2 text-sm"
        >
          <div className="flex items-center justify-between gap-2 text-sm">
            <MeterLabel className="font-medium text-primary">
              Storage used
            </MeterLabel>
            <MeterValue className="text-secondary" />
          </div>
        </MeterBar>
      </div>
      <div className="flex items-center gap-3">
        <MeterRing
          value={48}
          trackColor="#2e7d32"
          className="flex items-center gap-2 text-sm"
        >
          <MeterLabel className="font-medium text-primary">
            Syncing workspace
          </MeterLabel>
          <MeterValue className="text-secondary" />
        </MeterRing>
      </div>
    </div>
  );
}
