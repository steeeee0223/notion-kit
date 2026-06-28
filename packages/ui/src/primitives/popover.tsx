import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@notion-kit/cn";

import { CloseButton } from "./button";
import { popup, positioner } from "./design";

function Popover<Payload = unknown>({
  modal = false,
  ...props
}: PopoverPrimitive.Root.Props<Payload>) {
  return <PopoverPrimitive.Root data-slot="popover" modal={modal} {...props} />;
}

function PopoverTrigger<Payload = unknown>({
  ...props
}: PopoverPrimitive.Trigger.Props<Payload>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  return (
    <PopoverPrimitive.Close
      data-slot="popover-close"
      render={<CloseButton />}
      {...props}
    />
  );
}

type PopoverPositionerProps = Pick<
  PopoverPrimitive.Positioner.Props,
  | "align"
  | "alignOffset"
  | "anchor"
  | "collisionBoundary"
  | "collisionPadding"
  | "positionMethod"
  | "side"
  | "sideOffset"
>;

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  PopoverPositionerProps & {
    container?: PopoverPrimitive.Portal.Props["container"];
  };

function PopoverContent({
  className,
  align = "center",
  alignOffset,
  anchor,
  collisionBoundary,
  collisionPadding,
  container,
  positionMethod,
  side,
  sideOffset = 4,
  finalFocus = false,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        className={cn(positioner())}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(popup({ type: "popover" }), className)}
          finalFocus={finalFocus}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverClose, PopoverContent };
