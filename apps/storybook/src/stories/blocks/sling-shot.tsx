import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@notion-kit/cn";
import { COLOR } from "@notion-kit/utils";

interface Vector {
  x: number;
  y: number;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Point extends Vector {
  opacity: number;
}

type SlotName = "arrow" | "item" | "power" | "preview";

export interface SlingShotConfig {
  bounce?: number;
  friction?: number;
  gravity?: number;
  maxPull?: number;
  power?: number;
  previewStepMs?: number;
  previewSteps?: number;
  rotation?: number;
  shake?: boolean;
  shakeIntensity?: number;
  startDragDistance?: number;
}

export interface SlingShotLandEvent {
  position: Vector;
  velocity: Vector;
}

export interface SlingShotState {
  aimAngle: number;
  isAiming: boolean;
  isFlying: boolean;
  itemCenter: Vector;
  launchVector: Vector;
  power: number;
  previewPoints: Point[];
  pullVector: Vector;
  velocity: Vector;
}

export interface SlingShotProps extends React.ComponentProps<"div"> {
  boundsRef?: React.RefObject<HTMLElement | null>;
  config?: SlingShotConfig;
  disabled?: boolean;
  resetKey?: React.Key;
  onLand?: (event: SlingShotLandEvent) => void;
  onLaunch?: (velocity: Vector) => void;
}

export interface SlingShotPreviewProps extends SlingShotSlotProps {
  dotClassName?: string;
}

interface SlingShotContextValue {
  disabled?: boolean;
  itemRef: React.RefObject<HTMLElement | null>;
  position: Vector;
  rotation: number;
  shakeOffset: Vector;
  state: SlingShotState;
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
}

interface SlingShotSlotComponent {
  __slingShotSlot?: SlotName;
}

const DEFAULT_CONFIG = {
  bounce: 0.28,
  friction: 0.74,
  gravity: 2200,
  maxPull: 150,
  power: 7.5,
  previewStepMs: 72,
  previewSteps: 12,
  rotation: 0.035,
  shake: true,
  shakeIntensity: 5,
  startDragDistance: 6,
};

const ZERO_VECTOR = { x: 0, y: 0 };

const SlingShotContext = React.createContext<SlingShotContextValue | null>(
  null,
);

function useSlingShotContext(componentName: string) {
  const context = React.use(SlingShotContext);

  if (!context) {
    throw new Error(`${componentName} must be used inside <SlingShot>.`);
  }

  return context;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      ref.current = node;
    });
  };
}

function composeEventHandlers<E extends React.SyntheticEvent>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: (event: E) => void,
) {
  return (event: E) => {
    theirHandler?.(event);

    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}

function getBounds(element: HTMLElement | null): Box {
  if (!element) {
    return {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
    };
  }

  const rect = element.getBoundingClientRect();

  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function getSlotName(type: unknown) {
  if (typeof type === "string") return undefined;

  return (type as SlingShotSlotComponent).__slingShotSlot;
}

function limitVector(vector: Vector, max: number) {
  const length = Math.hypot(vector.x, vector.y);

  if (length <= max || length === 0) {
    return vector;
  }

  const scale = max / length;

  return {
    x: vector.x * scale,
    y: vector.y * scale,
  };
}

function negateVector(vector: Vector) {
  return {
    x: -vector.x,
    y: -vector.y,
  };
}

function getPreviewPoints({
  gravity,
  previewStepMs,
  previewSteps,
  start,
  velocity,
}: {
  gravity: number;
  previewStepMs: number;
  previewSteps: number;
  start: Vector;
  velocity: Vector;
}) {
  return Array.from({ length: previewSteps }, (_, index) => {
    const t = ((index + 1) * previewStepMs) / 1000;

    return {
      x: start.x + velocity.x * t,
      y: start.y + velocity.y * t + (gravity * t * t) / 2,
      opacity: 1 - index / previewSteps,
    };
  });
}

function hasExplicitItem(children: React.ReactNode) {
  let hasItem = false;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (getSlotName(child.type) === "item") {
      hasItem = true;
    }
  });

  return hasItem;
}

function splitSlotsAndItems(children: React.ReactNode) {
  const slots: React.ReactNode[] = [];
  const items: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && getSlotName(child.type)) {
      slots.push(child);
      return;
    }

    items.push(child);
  });

  return { items, slots };
}

function SlingShotRoot({
  boundsRef,
  children,
  className,
  config,
  disabled,
  onLand,
  onLaunch,
  resetKey,
  ...props
}: SlingShotProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const itemRef = React.useRef<HTMLElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const shakeFrameRef = React.useRef<number | null>(null);
  const pointerRef = React.useRef<number | null>(null);
  const captureElementRef = React.useRef<HTMLElement | null>(null);
  const pointerStartRef = React.useRef<Vector>(ZERO_VECTOR);
  const basePositionRef = React.useRef<Vector>(ZERO_VECTOR);
  const positionRef = React.useRef<Vector>(ZERO_VECTOR);
  const velocityRef = React.useRef<Vector>(ZERO_VECTOR);
  const pullVectorRef = React.useRef<Vector>(ZERO_VECTOR);
  const powerRef = React.useRef(0);
  const isAimingRef = React.useRef(false);
  const itemStartCenterRef = React.useRef<Vector>(ZERO_VECTOR);

  const resolvedConfig = React.useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config],
  );

  const [position, setPosition] = React.useState<Vector>(ZERO_VECTOR);
  const [rotation, setRotation] = React.useState(0);
  const [shakeOffset, setShakeOffset] = React.useState<Vector>(ZERO_VECTOR);
  const [activePointerId, setActivePointerId] = React.useState<number | null>(
    null,
  );
  const [state, setState] = React.useState<SlingShotState>({
    aimAngle: 0,
    isAiming: false,
    isFlying: false,
    itemCenter: ZERO_VECTOR,
    launchVector: ZERO_VECTOR,
    power: 0,
    previewPoints: [],
    pullVector: ZERO_VECTOR,
    velocity: ZERO_VECTOR,
  });

  const stopShake = React.useCallback(() => {
    if (shakeFrameRef.current !== null) {
      cancelAnimationFrame(shakeFrameRef.current);
      shakeFrameRef.current = null;
    }

    setShakeOffset(ZERO_VECTOR);
  }, []);

  const cancelFlight = React.useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const reset = React.useCallback(() => {
    cancelFlight();
    stopShake();
    basePositionRef.current = ZERO_VECTOR;
    positionRef.current = ZERO_VECTOR;
    velocityRef.current = ZERO_VECTOR;
    pullVectorRef.current = ZERO_VECTOR;
    powerRef.current = 0;
    pointerRef.current = null;
    captureElementRef.current = null;
    isAimingRef.current = false;
    setActivePointerId(null);
    setPosition(ZERO_VECTOR);
    setRotation(0);
    setState((value) => ({
      ...value,
      aimAngle: 0,
      isAiming: false,
      isFlying: false,
      launchVector: ZERO_VECTOR,
      power: 0,
      previewPoints: [],
      pullVector: ZERO_VECTOR,
      velocity: ZERO_VECTOR,
    }));
  }, [cancelFlight, stopShake]);

  React.useEffect(() => {
    reset();
  }, [reset, resetKey]);

  React.useEffect(() => {
    return () => {
      cancelFlight();
      stopShake();
    };
  }, [cancelFlight, stopShake]);

  const startShake = React.useCallback(() => {
    if (!resolvedConfig.shake || shakeFrameRef.current !== null) return;

    const tick = () => {
      if (!isAimingRef.current) {
        shakeFrameRef.current = null;
        setShakeOffset(ZERO_VECTOR);
        return;
      }

      const amplitude = powerRef.current * resolvedConfig.shakeIntensity;
      setShakeOffset({
        x: (Math.random() - 0.5) * amplitude,
        y: (Math.random() - 0.5) * amplitude,
      });
      shakeFrameRef.current = requestAnimationFrame(tick);
    };

    shakeFrameRef.current = requestAnimationFrame(tick);
  }, [resolvedConfig.shake, resolvedConfig.shakeIntensity]);

  const setAimingState = React.useCallback(
    (pullVector: Vector) => {
      const root = rootRef.current;
      const launchVector = negateVector(pullVector);
      const velocity = {
        x: launchVector.x * resolvedConfig.power,
        y: launchVector.y * resolvedConfig.power,
      };
      const power = clamp(
        Math.hypot(pullVector.x, pullVector.y) / resolvedConfig.maxPull,
        0,
        1,
      );
      const itemCenter = {
        x: itemStartCenterRef.current.x + pullVector.x,
        y: itemStartCenterRef.current.y + pullVector.y,
      };
      const previewPoints = getPreviewPoints({
        gravity: resolvedConfig.gravity,
        previewStepMs: resolvedConfig.previewStepMs,
        previewSteps: resolvedConfig.previewSteps,
        start: itemCenter,
        velocity,
      });

      pullVectorRef.current = pullVector;
      powerRef.current = power;
      positionRef.current = {
        x: basePositionRef.current.x + pullVector.x,
        y: basePositionRef.current.y + pullVector.y,
      };

      setPosition(positionRef.current);
      setRotation(pullVector.x * resolvedConfig.rotation);
      setState({
        aimAngle: Math.atan2(launchVector.y, launchVector.x),
        isAiming: isAimingRef.current,
        isFlying: false,
        itemCenter: root ? itemCenter : ZERO_VECTOR,
        launchVector,
        power,
        previewPoints,
        pullVector,
        velocity,
      });
    },
    [resolvedConfig],
  );

  const clearAimState = React.useCallback(() => {
    pointerRef.current = null;
    captureElementRef.current = null;
    isAimingRef.current = false;
    positionRef.current = basePositionRef.current;
    pullVectorRef.current = ZERO_VECTOR;
    powerRef.current = 0;
    setActivePointerId(null);
    setPosition(basePositionRef.current);
    setRotation(0);
    setState((value) => ({
      ...value,
      isAiming: false,
      launchVector: ZERO_VECTOR,
      power: 0,
      previewPoints: [],
      pullVector: ZERO_VECTOR,
      velocity: ZERO_VECTOR,
    }));
  }, []);

  const startFlight = React.useCallback(
    (pullVector: Vector) => {
      const item = itemRef.current;

      if (!item) return;

      const currentRect = item.getBoundingClientRect();
      const layoutRect = {
        left: currentRect.left - positionRef.current.x,
        top: currentRect.top - positionRef.current.y,
        width: currentRect.width,
        height: currentRect.height,
      };

      velocityRef.current = {
        x: -pullVector.x * resolvedConfig.power,
        y: -pullVector.y * resolvedConfig.power,
      };

      onLaunch?.(velocityRef.current);
      setState((value) => ({
        ...value,
        isAiming: false,
        isFlying: true,
        previewPoints: [],
        velocity: velocityRef.current,
      }));

      const bounds = getBounds(boundsRef?.current ?? null);
      const minX = bounds.left - layoutRect.left;
      const maxX = bounds.right - layoutRect.left - layoutRect.width;
      const minY = bounds.top - layoutRect.top;
      const groundY = bounds.bottom - layoutRect.top - layoutRect.height;
      let bounceCount = 0;
      let lastTime = performance.now();

      const tick = (time: number) => {
        const dt = Math.min((time - lastTime) / 1000, 0.032);
        lastTime = time;

        const velocity = velocityRef.current;
        const current = positionRef.current;
        let nextX = current.x + velocity.x * dt;
        let nextY = current.y + velocity.y * dt;
        let nextVx = velocity.x;
        let nextVy = velocity.y + resolvedConfig.gravity * dt;

        if (nextX <= minX || nextX >= maxX) {
          nextX = clamp(nextX, minX, maxX);
          nextVx = -nextVx * resolvedConfig.bounce;
        }

        if (nextY <= minY) {
          nextY = minY;
          nextVy = Math.abs(nextVy) * resolvedConfig.bounce;
        }

        if (nextY >= groundY) {
          nextY = groundY;

          if (Math.abs(nextVy) > 420 && bounceCount < 2) {
            nextVy = -nextVy * resolvedConfig.bounce;
            nextVx *= resolvedConfig.friction;
            bounceCount += 1;
          } else {
            const settledPosition = {
              x: clamp(nextX, minX, maxX),
              y: groundY,
            };
            const settledVelocity = { x: 0, y: 0 };

            positionRef.current = settledPosition;
            velocityRef.current = settledVelocity;
            setPosition(settledPosition);
            setRotation(settledPosition.x * resolvedConfig.rotation);
            setState((value) => ({
              ...value,
              isFlying: false,
              velocity: settledVelocity,
            }));
            onLand?.({
              position: settledPosition,
              velocity: settledVelocity,
            });
            frameRef.current = null;
            return;
          }
        }

        const nextPosition = { x: nextX, y: nextY };

        positionRef.current = nextPosition;
        velocityRef.current = { x: nextVx, y: nextVy };
        setPosition(nextPosition);
        setRotation((value) => value + nextVx * dt * resolvedConfig.rotation);

        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    },
    [boundsRef, onLand, onLaunch, resolvedConfig],
  );

  const beginDrag = React.useCallback(
    (
      pointerId: number,
      clientX: number,
      clientY: number,
      target: HTMLElement,
    ) => {
      const item = itemRef.current;
      const root = rootRef.current;

      if (!item || !root || disabled || state.isFlying) return;

      cancelFlight();
      pointerRef.current = pointerId;
      setActivePointerId(pointerId);
      captureElementRef.current = target;
      pointerStartRef.current = { x: clientX, y: clientY };
      basePositionRef.current = positionRef.current;

      const itemRect = item.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      itemStartCenterRef.current = {
        x: itemRect.left - rootRect.left + itemRect.width / 2,
        y: itemRect.top - rootRect.top + itemRect.height / 2,
      };
    },
    [cancelFlight, disabled, state.isFlying],
  );

  const moveDrag = React.useCallback(
    (pointerId: number, clientX: number, clientY: number) => {
      if (pointerRef.current !== pointerId) return false;

      const rawVector = {
        x: clientX - pointerStartRef.current.x,
        y: clientY - pointerStartRef.current.y,
      };

      if (!isAimingRef.current) {
        const distance = Math.hypot(rawVector.x, rawVector.y);

        if (distance < resolvedConfig.startDragDistance) return false;

        isAimingRef.current = true;
        setState((value) => ({ ...value, isAiming: true }));
        startShake();
      }

      setAimingState(limitVector(rawVector, resolvedConfig.maxPull));
      return true;
    },
    [
      resolvedConfig.maxPull,
      resolvedConfig.startDragDistance,
      setAimingState,
      startShake,
    ],
  );

  const endDrag = React.useCallback(
    (pointerId: number) => {
      if (pointerRef.current !== pointerId) return false;

      const shouldLaunch = isAimingRef.current;
      const pullVector = pullVectorRef.current;

      pointerRef.current = null;
      captureElementRef.current = null;
      setActivePointerId(null);
      isAimingRef.current = false;
      pullVectorRef.current = ZERO_VECTOR;
      powerRef.current = 0;
      stopShake();

      if (!shouldLaunch || Math.hypot(pullVector.x, pullVector.y) < 8) {
        clearAimState();
        return false;
      }

      startFlight(pullVector);
      return true;
    },
    [clearAimState, startFlight, stopShake],
  );

  React.useEffect(() => {
    if (activePointerId === null) return;

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (moveDrag(event.pointerId, event.clientX, event.clientY)) {
        event.preventDefault();
      }
    };

    const handleWindowPointerRelease = (event: PointerEvent) => {
      if (endDrag(event.pointerId)) {
        event.preventDefault();
      }
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handleWindowPointerRelease, {
      passive: false,
    });
    window.addEventListener("pointercancel", handleWindowPointerRelease, {
      passive: false,
    });
    window.addEventListener("blur", clearAimState);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerRelease);
      window.removeEventListener("pointercancel", handleWindowPointerRelease);
      window.removeEventListener("blur", clearAimState);
    };
  }, [activePointerId, clearAimState, endDrag, moveDrag]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      beginDrag(
        event.pointerId,
        event.clientX,
        event.clientY,
        event.currentTarget,
      );

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Window-level listeners keep the interaction alive if capture fails.
      }
    },
    [beginDrag],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (moveDrag(event.pointerId, event.clientX, event.clientY)) {
        event.preventDefault();
      }
    },
    [moveDrag],
  );

  const handlePointerRelease = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      try {
        if (captureElementRef.current?.hasPointerCapture(event.pointerId)) {
          captureElementRef.current.releasePointerCapture(event.pointerId);
        }
      } catch {
        // The browser may release capture before React receives this event.
      }

      if (endDrag(event.pointerId)) {
        event.preventDefault();
      }
    },
    [endDrag],
  );

  const explicitItem = hasExplicitItem(children);
  const renderedChildren = React.useMemo(() => {
    if (explicitItem) return children;

    const { items, slots } = splitSlotsAndItems(children);

    return (
      <>
        {slots}
        <SlingShotItem>{items}</SlingShotItem>
      </>
    );
  }, [children, explicitItem]);

  const contextValue = React.useMemo<SlingShotContextValue>(
    () => ({
      disabled,
      itemRef,
      onPointerCancel: handlePointerRelease,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerRelease,
      position,
      rotation,
      shakeOffset,
      state,
    }),
    [
      disabled,
      handlePointerDown,
      handlePointerMove,
      handlePointerRelease,
      position,
      rotation,
      shakeOffset,
      state,
    ],
  );

  return (
    <SlingShotContext value={contextValue}>
      <div
        data-slot="sling-shot-root"
        ref={rootRef}
        className={cn(
          "relative inline-block touch-none overflow-visible select-none",
          disabled && "pointer-events-none opacity-60",
          className,
        )}
        {...props}
      >
        {renderedChildren}
      </div>
    </SlingShotContext>
  );
}

export interface SlingShotSlotProps extends React.ComponentProps<"div"> {
  render?: (props: SlingShotState) => React.ReactNode;
}

function SlingShotSlot({ render, children, ...props }: SlingShotSlotProps) {
  const { state } = useSlingShotContext("SlingShotPower");
  return typeof render !== "undefined" ? (
    <Slot.Root {...props}>{render(state)}</Slot.Root>
  ) : (
    <div {...props}>{children}</div>
  );
}

function SlingShotItem({
  className,
  ref,
  style,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  render,
  ...props
}: SlingShotSlotProps) {
  const context = useSlingShotContext("SlingShotItem");
  const transform = `translate3d(${context.position.x + context.shakeOffset.x}px, ${context.position.y + context.shakeOffset.y}px, 0) rotate(${context.rotation}deg)`;

  return (
    <SlingShotSlot
      render={render}
      data-slot="sling-shot-item"
      ref={
        composeRefs(
          context.itemRef,
          ref as React.Ref<HTMLElement>,
        ) as React.Ref<HTMLDivElement>
      }
      className={cn(
        "relative z-10 inline-block touch-none will-change-transform",
        context.state.isAiming ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      style={{
        ...style,
        transform,
      }}
      onPointerCancel={composeEventHandlers(
        onPointerCancel,
        context.onPointerCancel,
      )}
      onPointerDown={composeEventHandlers(onPointerDown, context.onPointerDown)}
      onPointerMove={composeEventHandlers(onPointerMove, context.onPointerMove)}
      onPointerUp={composeEventHandlers(onPointerUp, context.onPointerUp)}
      {...props}
    />
  );
}

function SlingShotPower({
  className,
  style,
  render,
  ...props
}: SlingShotSlotProps) {
  const { state } = useSlingShotContext("SlingShotPower");
  if (!state.isAiming) return null;

  const value = Math.round(state.power * 100);

  return (
    <SlingShotSlot
      render={render}
      data-slot="sling-shot-power"
      role="progressbar"
      aria-valuenow={value}
      className={cn(
        "pointer-events-none absolute z-40 flex w-full min-w-24 items-center justify-stretch self-stretch shadow-lg",
        className,
      )}
      style={{
        left: state.itemCenter.x,
        top: state.itemCenter.y - 32,
        transform: "translateX(-50%)",
        ...style,
      }}
      {...props}
    >
      <div className="relative h-1 min-h-1 w-full overflow-hidden rounded-full bg-default/10">
        <div
          className="absolute h-full rounded-full"
          style={{
            backgroundColor: COLOR.blue.hex,
            opacity: 0.3,
            width: `calc(${value}% + 2px)`,
          }}
        />
        <div
          className="absolute h-full rounded-full"
          style={{
            backgroundColor: COLOR.blue.hex,
            width: `${value}%`,
          }}
        />
      </div>
    </SlingShotSlot>
  );
}

function SlingShotArrow({
  className,
  style,
  render,
  ...props
}: SlingShotSlotProps) {
  const { state } = useSlingShotContext("SlingShotArrow");
  if (!state.isAiming || state.power === 0) return null;

  return (
    <SlingShotSlot
      render={render}
      data-slot="sling-shot-arrow"
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-30 h-1 rounded-full bg-blue",
        className,
      )}
      style={{
        left: state.itemCenter.x,
        top: state.itemCenter.y,
        transform: `rotate(${state.aimAngle}rad)`,
        transformOrigin: "0 50%",
        width: 36 + state.power * 84,
        ...style,
      }}
      {...props}
    >
      <div className="absolute top-1/2 right-0 size-3 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-blue" />
    </SlingShotSlot>
  );
}

function SlingShotPreview({
  className,
  dotClassName,
  render,
  ...props
}: SlingShotPreviewProps) {
  const { state } = useSlingShotContext("SlingShotPreview");
  if (!state.isAiming || state.previewPoints.length === 0) return null;

  return (
    <SlingShotSlot
      render={render}
      data-slot="sling-shot-preview"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-20", className)}
      {...props}
    >
      {state.previewPoints.map((point, index) => (
        <div
          key={index}
          className={cn(
            "absolute size-1.5 rounded-full bg-blue shadow-sm",
            dotClassName,
          )}
          style={{
            left: point.x,
            opacity: point.opacity,
            top: point.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </SlingShotSlot>
  );
}

SlingShotItem.__slingShotSlot = "item";
SlingShotPower.__slingShotSlot = "power";
SlingShotArrow.__slingShotSlot = "arrow";
SlingShotPreview.__slingShotSlot = "preview";

export const SlingShot = Object.assign(SlingShotRoot, {
  Arrow: SlingShotArrow,
  Item: SlingShotItem,
  Power: SlingShotPower,
  Preview: SlingShotPreview,
});
