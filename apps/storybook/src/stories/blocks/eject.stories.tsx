import * as React from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Eject, type EjectRef } from "@notion-kit/cool-blocks/eject";
import { Icon } from "@notion-kit/icons";
import { Button, Input } from "@notion-kit/ui/primitives";

const meta = {
  title: "interesting/Eject",
  component: Eject,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["respawn", "disappear", "ghost"],
    },
  },
} satisfies Meta<typeof Eject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const ref = React.useRef<EjectRef>(null);
    return (
      <Eject ref={ref} mode="respawn">
        <Button size="md" onClick={() => ref.current?.eject()}>
          Click to Eject (Respawn)
        </Button>
      </Eject>
    );
  },
};

export const DisappearMode: Story = {
  render: () => {
    const ref = React.useRef<EjectRef>(null);
    return (
      <Eject ref={ref} mode="disappear">
        <Button size="md" variant="red" onClick={() => ref.current?.eject()}>
          Click to Eject (Disappear)
        </Button>
      </Eject>
    );
  },
};

export const GhostMode: Story = {
  render: () => {
    const ref = React.useRef<EjectRef>(null);
    return (
      <Eject ref={ref} mode="ghost">
        <Button size="md" onClick={() => ref.current?.eject()}>
          Click to Eject (Ghost)
        </Button>
      </Eject>
    );
  },
};

export const KeyboardShortcut: Story = {
  args: {
    mode: "respawn",
    shortcut: "mod+e",
    children: (
      <div className="flex h-32 w-64 cursor-pointer items-center justify-center rounded-lg bg-input">
        Press ⌘/Ctrl + E to Eject
      </div>
    ),
  },
};

export const ContextMenuTrigger: Story = {
  render: () => {
    const ref = React.useRef<EjectRef>(null);
    return (
      <Eject ref={ref} mode="respawn">
        <Button
          size="md"
          variant="hint"
          onContextMenu={(e) => {
            e.preventDefault();
            void ref.current?.eject();
          }}
        >
          Right Click to Eject
        </Button>
      </Eject>
    );
  },
};

const controls = [
  {
    key: "duration",
    label: "Total Duration (s)",
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  { key: "vx", label: "Velocity X", min: 0, max: 1000, step: 50 },
  { key: "maxY", label: "Peak Y", min: 0, max: 1000, step: 50 },
  {
    key: "rotate",
    label: "Rotate Target (deg)",
    min: 0,
    max: 1440,
    step: 45,
  },
  {
    key: "scaleTarget",
    label: "Scale Target",
    min: 0.1,
    max: 2,
    step: 0.1,
  },
] as const;

export const Playground: Story = {
  render: () => {
    const ejectRef = React.useRef<EjectRef>(null);
    const [config, setConfig] = React.useState({
      force: 1,
      duration: 1.5,
      vx: 700,
      maxY: 300,
      rotate: 360,
      scaleTarget: 0.5,
    });

    return (
      <div className="flex flex-col items-center gap-12 p-8">
        <div className="flex w-80 flex-col gap-6 rounded-lg bg-input p-6 shadow-lg">
          <h3 className="font-semibold text-primary">Physics Controls</h3>

          {controls.map(({ key, label, min, max, step }) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="flex justify-between text-sm text-secondary">
                <span>{label}</span>
                <span className="font-mono">{config[key]}</span>
              </label>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={config[key]}
                onChange={(e) =>
                  setConfig((v) => ({ ...v, [key]: Number(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>

        <Eject ref={ejectRef} mode="respawn" config={config}>
          <Button
            variant="red"
            size="md"
            onClick={() => ejectRef.current?.eject()}
          >
            Eject Me!
          </Button>
        </Eject>
      </div>
    );
  },
};

const EjectFormTemplate = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [inputEjected, setInputEjected] = React.useState(false);

  const [formState, setFormState] = React.useState<
    "submitting" | "submitSuccess" | "initial"
  >("initial");

  const dialogRef = React.useRef<EjectRef>(null);
  const buttonRef = React.useRef<EjectRef>(null);
  const inputRef = React.useRef<EjectRef>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    void buttonRef.current?.eject();

    // Simulate API call and success
    setTimeout(() => {
      setFormState("submitSuccess");
      void dialogRef.current?.eject();
      setInputEjected(false);
      setFormState("initial");
      setInputValue("");
    }, 1500);
  };

  return (
    <Eject
      id="form"
      ref={dialogRef}
      className="relative flex w-full flex-col gap-6 rounded-lg border bg-modal p-8 shadow-xl"
    >
      <div className="text-2xl font-semibold">Subscribe to Newsletter</div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="h-10">
          {/* Value left behind when input flies away */}
          {inputEjected && <div className="px-3 text-sm">{inputValue}</div>}

          <Eject id="input" ref={inputRef} mode="disappear">
            <Input
              name="email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your email"
              onBlur={() => {
                if (inputValue) {
                  setInputEjected(true);
                  void inputRef.current?.eject();
                }
              }}
            />
          </Eject>
        </div>

        <div className="h-10 w-full">
          {formState === "submitting" && (
            <div className="text-sm font-medium">Submitting...</div>
          )}
          {formState === "submitSuccess" && (
            <div className="text-sm font-medium">
              <Icon.Check className="size-4 text-green-700" />
              Success!
            </div>
          )}
          <Eject ref={buttonRef} id="button" mode="disappear">
            <Button
              type="submit"
              variant="blue"
              size="sm"
              disabled={formState !== "initial"}
            >
              Subscribe
            </Button>
          </Eject>
        </div>
      </form>
    </Eject>
  );
};

export const DialogForm: Story = {
  render: () => <EjectFormTemplate />,
};
