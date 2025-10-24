import { cn } from "@notion-kit/cn";
import { COLOR, type Color } from "@notion-kit/utils";

interface ProgressBarProps {
  className?: string;
  value: number;
  color: Color;
}

export function ProgressBar({ className, value, color }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      className={cn(
        "pointer-events-auto flex w-full items-center justify-stretch self-stretch",
        className,
      )}
    >
      <div className="relative h-1 min-h-1 w-full overflow-hidden rounded-full bg-default/10">
        <div
          className="absolute h-full rounded-full"
          style={{
            backgroundColor: COLOR[color].hex,
            opacity: 0.3,
            width: `calc(${value}% + 2px)`,
          }}
        />
        <div
          className="absolute h-full rounded-full"
          style={{
            backgroundColor: COLOR[color].hex,
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}
