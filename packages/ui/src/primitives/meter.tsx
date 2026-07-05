import { Meter as MeterPrimitive } from "@base-ui/react/meter";

import { cn } from "@notion-kit/cn";

function Meter({ ...props }: MeterPrimitive.Root.Props) {
  return <MeterPrimitive.Root data-slot="meter" {...props} />;
}

function MeterTrack({ ...props }: MeterPrimitive.Track.Props) {
  return <MeterPrimitive.Track data-slot="meter-track" {...props} />;
}

function MeterIndicator({ ...props }: MeterPrimitive.Indicator.Props) {
  return <MeterPrimitive.Indicator data-slot="meter-indicator" {...props} />;
}

function MeterValue({ ...props }: MeterPrimitive.Value.Props) {
  return <MeterPrimitive.Value data-slot="meter-value" {...props} />;
}

function MeterLabel({ ...props }: MeterPrimitive.Label.Props) {
  return <MeterPrimitive.Label data-slot="meter-label" {...props} />;
}

interface MeterBarProps extends MeterPrimitive.Root.Props {
  trackColor?: string;
}

function MeterBar({
  value,
  trackColor,
  className,
  children,
  ...props
}: MeterBarProps) {
  return (
    <Meter
      data-slot="meter-bar"
      value={value}
      className={cn(
        "pointer-events-none relative flex w-full items-center justify-stretch self-stretch",
        className,
      )}
      {...props}
    >
      {children}
      <MeterTrack
        data-slot="meter-bar-track"
        className="relative h-1 min-h-1 w-full overflow-hidden rounded-full bg-default/10"
      >
        <MeterIndicator
          data-slot="meter-bar-indicator"
          className="absolute h-full rounded-full"
          style={{ backgroundColor: trackColor }}
        />
      </MeterTrack>
    </Meter>
  );
}

interface MeterRingProps extends MeterPrimitive.Root.Props {
  trackColor?: string;
}

function MeterRing({
  value,
  max = 100,
  trackColor,
  className,
  children,
  ...props
}: MeterRingProps) {
  const r = 6;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(Math.max(value, 0), max);
  const offset = circumference * (1 - progress / max);

  return (
    <Meter
      data-slot="meter-ring"
      value={value}
      min={0}
      max={max}
      aria-valuetext={`Loading progress: ${value}%`}
      className={cn("inline-flex", className)}
      {...props}
    >
      {children}
      <MeterTrack
        data-slot="meter-ring-track"
        render={
          <svg
            viewBox="0 0 14 14"
            width="21"
            height="21"
            aria-hidden="true"
            focusable="false"
            className="size-[21px] shrink-0"
          />
        }
      >
        <circle
          cx="7"
          cy="7"
          r={r}
          fill="none"
          strokeWidth="2"
          className="stroke-default/10"
        />

        <MeterIndicator
          data-slot="meter-ring-indicator"
          render={
            <g transform="rotate(-90 7 7)">
              <circle
                cx="7"
                cy="7"
                r={r}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transition: "stroke-dashoffset 0.5s ease-out",
                  stroke: trackColor,
                }}
              />
            </g>
          }
        />
      </MeterTrack>
    </Meter>
  );
}

export { Meter, MeterValue, MeterLabel, MeterBar, MeterRing };
