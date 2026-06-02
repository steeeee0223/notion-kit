import * as React from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Icon } from "@notion-kit/icons";
import { Badge, Button } from "@notion-kit/ui/primitives";

import { SlingShot, type SlingShotProps } from "./sling-shot";

const meta = {
  title: "interesting/Sling Shot",
  component: SlingShot,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SlingShot>;

export default meta;
type Story = StoryObj<typeof meta>;

function DemoStage(args: SlingShotProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [resetKey, setResetKey] = React.useState(0);
  const [status, setStatus] = React.useState("ready");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="gray" className="font-mono">
          {status}
        </Badge>
        <Button
          size="sm"
          variant="hint"
          onClick={() => {
            setStatus("ready");
            setResetKey((value) => value + 1);
          }}
        >
          Reset
        </Button>
      </div>

      <div
        ref={stageRef}
        className="relative h-120 w-200 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-25" />

        <div className="relative z-10 flex items-start justify-between gap-8 p-12">
          <SlingShot
            {...args}
            boundsRef={stageRef}
            resetKey={resetKey}
            onLaunch={() => setStatus("launched")}
            onLand={({ position }) =>
              setStatus(`${Math.round(position.x)}, ${Math.round(position.y)}`)
            }
          >
            <SlingShot.Power />
            <SlingShot.Arrow />
            <SlingShot.Preview />
            <SlingShot.Item>
              <Button size="md" variant="blue">
                Launch
              </Button>
            </SlingShot.Item>
          </SlingShot>

          <SlingShot
            {...args}
            boundsRef={stageRef}
            resetKey={resetKey}
            onLaunch={() => setStatus("launched")}
            onLand={({ position }) =>
              setStatus(`${Math.round(position.x)}, ${Math.round(position.y)}`)
            }
          >
            <SlingShot.Arrow />
            <div className="flex h-24 w-36 flex-col justify-between rounded-lg border border-border bg-modal p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <Icon.Lightning className="size-5 text-blue" />
                <Badge variant="blue">New</Badge>
              </div>
              <div className="text-sm font-medium text-primary">
                Wrapped card
              </div>
            </div>
          </SlingShot>

          <SlingShot
            {...args}
            boundsRef={stageRef}
            resetKey={resetKey}
            onLaunch={() => setStatus("launched")}
            onLand={({ position }) =>
              setStatus(`${Math.round(position.x)}, ${Math.round(position.y)}`)
            }
          >
            <SlingShot.Power />
            <SlingShot.Arrow
              render={({ aimAngle, itemCenter, power }) => (
                <div
                  className="pointer-events-none absolute z-30 h-0.5 rounded-full bg-orange"
                  style={{
                    left: itemCenter.x,
                    top: itemCenter.y,
                    transform: `rotate(${aimAngle}rad)`,
                    transformOrigin: "0 50%",
                    width: 28 + power * 76,
                  }}
                />
              )}
            />
            <SlingShot.Preview dotClassName="bg-orange" />
            <SlingShot.Item>
              <div className="flex size-20 items-center justify-center rounded-lg bg-input shadow-lg">
                <Icon.ArrowInCircleUpFill className="size-8 text-orange" />
              </div>
            </SlingShot.Item>
          </SlingShot>
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  args: {
    config: {
      power: 7.5,
      gravity: 2200,
      maxPull: 150,
      bounce: 0.28,
      friction: 0.74,
      previewSteps: 12,
      shake: true,
    },
  },
  render: (args) => <DemoStage {...args} />,
};

export const SoftLanding: Story = {
  args: {
    config: {
      power: 5.6,
      gravity: 1800,
      maxPull: 120,
      bounce: 0.14,
      friction: 0.64,
      rotation: 0.018,
      previewSteps: 8,
      shakeIntensity: 2.5,
    },
  },
  render: (args) => <DemoStage {...args} />,
};
