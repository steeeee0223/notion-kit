import { Button } from "@notion-kit/shadcn";

import type { NumberDisplayType } from "../types";

interface DisplayTypeSelectProps {
  type: NumberDisplayType;
  onUpdate: (type: NumberDisplayType) => void;
}

// TODO: default color: text color
// TODO: selected color: blue or the color of the property

export function DisplayTypeSelect({ type, onUpdate }: DisplayTypeSelectProps) {
  return (
    <div className="mx-2 mt-1.5 flex items-center justify-between gap-1.5">
      <Button
        tabIndex={0}
        className="flex h-13 flex-[1_1_0] flex-col px-3 aria-selected:border-2 aria-selected:border-blue"
        aria-selected={type === "number"}
        onClick={() => onUpdate("number")}
      >
        <div className="mb-1 flex h-5 w-full items-center justify-center">
          <div className="font-size: 16px; font-medium">42</div>
        </div>
        <div className="text-xs/none">Number</div>
      </Button>
      <Button
        tabIndex={0}
        className="color: var(--c-bluTexAccPri); flex h-13 flex-[1_1_0] flex-col px-3 aria-selected:border-2 aria-selected:border-blue"
        aria-selected={type === "bar"}
        onClick={() => onUpdate("bar")}
      >
        <div className="mb-1 flex h-5 w-full items-center justify-center">
          <div
            role="progressbar"
            aria-valuenow={50}
            className="pointer-events-auto flex w-full items-center justify-stretch self-stretch"
          >
            <div className="background-color: var(--ca-bluBacTerTra); relative h-1 min-h-1 w-full overflow-hidden rounded-full bg-blue/20">
              <div className="absolute h-full w-[calc(50%+2px)] rounded-full bg-transparent" />
              <div className="background-color: var(--c-bluBacAccPri); absolute h-full w-1/2 rounded-full bg-blue" />
            </div>
          </div>
        </div>
        <div className="text-xs/none">Bar</div>
      </Button>
      <Button
        tabIndex={0}
        className="box-shadow: 0 0 0 1px var(--ca-regDivCol); color: var(--c-texSec); flex h-13 flex-[1_1_0] flex-col px-3 aria-selected:border-2 aria-selected:border-blue"
        aria-selected={type === "ring"}
        onClick={() => onUpdate("ring")}
      >
        <div className="mb-1 flex h-5 w-full items-center justify-center">
          <div
            role="progressbar"
            aria-valuenow={40}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading progress: 40%"
            className="inline-flex"
          >
            <svg
              viewBox="0 0 14 14"
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
              className="size-5 shrink-0"
            >
              <circle
                cx="7"
                cy="7"
                r="6"
                fill="none"
                stroke-width="2"
                // className="stroke: var(--ca-graBacTerTra)"
                className="stroke-blue/20"
              />
              <g transform="rotate(-90 7 7)">
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="37.69911184307752"
                  strokeDashoffset="22.61946710584651"
                  className="stroke-blue transition-[stroke-dashoffset] duration-500 ease-out"
                  // className="stroke: var(--c-graIcoAccPri); transition: stroke-dashoffset 0.5s ease-out;"
                />
              </g>
            </svg>
          </div>
        </div>
        <div className="text-xs/none">Ring</div>
      </Button>
    </div>
  );
}
