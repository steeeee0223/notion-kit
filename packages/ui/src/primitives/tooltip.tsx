import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@notion-kit/cn";

import { popup, positioner } from "./design";

function TooltipProvider({ ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider {...props} />;
}

function Tooltip<Payload = unknown>({
  ...props
}: TooltipPrimitive.Root.Props<Payload>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger<Payload = unknown>({
  ...props
}: TooltipPrimitive.Trigger.Props<Payload>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

type TooltipPositionerProps = Pick<
  TooltipPrimitive.Positioner.Props,
  | "align"
  | "alignOffset"
  | "anchor"
  | "collisionPadding"
  | "side"
  | "sideOffset"
>;

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  TooltipPositionerProps;

function TooltipContent({
  align,
  alignOffset,
  anchor,
  className,
  collisionPadding,
  side,
  sideOffset = 4,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        className={cn(positioner())}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(popup({ type: "tooltip" }), className)}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

interface TooltipPresetProps extends Omit<
  TooltipContentProps,
  "children" | "render"
> {
  disabled?: boolean;
  children: React.ReactElement;
  description: React.ReactNode;
}

function TooltipPreset({
  children,
  disabled,
  side = "bottom",
  description,
  ...props
}: TooltipPresetProps) {
  return (
    <Tooltip disabled={disabled}>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} {...props}>
        {typeof description === "string" ? (
          <TooltipDescription text={description} />
        ) : (
          description
        )}
      </TooltipContent>
    </Tooltip>
  );
}

interface TooltipDescriptionProps {
  type?: "primary" | "secondary" | "image";
  text: string;
  className?: string;
}

function TooltipDescription({
  type = "primary",
  text,
  className,
}: TooltipDescriptionProps) {
  const id = React.useId();

  switch (type) {
    case "secondary":
      return (
        <span
          data-slot="tooltip-desc-2"
          data-tooltip-desc={id}
          className={cn("text-tooltip-secondary", className)}
        >
          {text}
        </span>
      );
    case "image":
      return (
        <img
          data-slot="tooltip-desc-img"
          data-tooltip-desc={id}
          src={text}
          alt=""
          className={cn("my-1 w-35 rounded-sm", className)}
        />
      );
    default:
      return (
        <div
          data-slot="tooltip-desc-1"
          data-tooltip-desc={id}
          className={className}
        >
          {text}
        </div>
      );
  }
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipDescription,
  TooltipPreset,
};

export type {
  TooltipContentProps,
  TooltipPresetProps,
  TooltipDescriptionProps,
};
