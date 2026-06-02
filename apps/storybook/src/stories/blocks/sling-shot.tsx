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

type SlotName = "arrow" | "goal" | "item" | "power" | "preview";

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
  itemId: string;
  position: Vector;
  velocity: Vector;
}

export interface SlingShotHitEvent {
  goalElement: HTMLElement;
  goalId: string;
  goalRect: DOMRect;
  itemElement: HTMLElement;
  itemId: string;
  itemRect: DOMRect;
  velocity: Vector;
}

export interface SlingShotGoalState {
  hitCount: number;
  isHit: boolean;
  lastHit: SlingShotHitEvent | null;
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
  onGoalHit?: (event: SlingShotHitEvent) => void;
  onLand?: (event: SlingShotLandEvent) => void;
  onLaunch?: (velocity: Vector, itemId: string) => void;
}

// ─── Per-item physics state ──────────────────────────────────────────────────

interface ItemPhysicsState {
  basePosition: Vector;
  baseRotation: number;
  captureElement: HTMLElement | null;
  element: HTMLElement | null;
  frameId: number | null;
  hitGoalIds: Set<string>;
  isAiming: boolean;
  isFlying: boolean;
  itemStartCenter: Vector;
  pointerId: number | null;
  pointerStart: Vector;
  position: Vector;
  power: number;
  pullVector: Vector;
  rotation: number;
  shakeFrameId: number | null;
  shakeOffset: Vector;
  velocity: Vector;
}

function createItemState(): ItemPhysicsState {
  return {
    basePosition: ZERO_VECTOR,
    baseRotation: 0,
    captureElement: null,
    element: null,
    frameId: null,
    hitGoalIds: new Set(),
    isAiming: false,
    isFlying: false,
    itemStartCenter: ZERO_VECTOR,
    pointerId: null,
    pointerStart: ZERO_VECTOR,
    position: ZERO_VECTOR,
    power: 0,
    pullVector: ZERO_VECTOR,
    rotation: 0,
    shakeFrameId: null,
    shakeOffset: ZERO_VECTOR,
    velocity: ZERO_VECTOR,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface SlingShotContextValue {
  activeItemId: string | null;
  activeState: SlingShotState | null;
  disabled?: boolean;
  getItemState: (id: string) => { isAiming: boolean; isFlying: boolean };
  getItemTransform: (id: string) => {
    position: Vector;
    rotation: number;
    shakeOffset: Vector;
  };
  onPointerCancel: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  onPointerDown: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  registerGoal: (goal: SlingShotGoalRegistration) => () => void;
  registerItem: (id: string, element: HTMLElement) => () => void;
}

interface SlingShotSlotComponent {
  __slingShotSlot?: SlotName;
}

interface SlingShotGoalRegistration {
  element: HTMLElement;
  hitTest?: (event: SlingShotHitEvent) => boolean;
  id: string;
  notifyHit: (event: SlingShotHitEvent) => void;
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

const FALLBACK_SLING_STATE: SlingShotState = {
  aimAngle: 0,
  isAiming: false,
  isFlying: false,
  itemCenter: ZERO_VECTOR,
  launchVector: ZERO_VECTOR,
  power: 0,
  previewPoints: [],
  pullVector: ZERO_VECTOR,
  velocity: ZERO_VECTOR,
};

const SlingShotContext = React.createContext<SlingShotContextValue | null>(null);

function useSlingShotContext() {
  const ctx = React.use(SlingShotContext);
  if (!ctx) {
    throw new Error("useSlingShotContext must be used inside <SlingShot>.");
  }
  return ctx;
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

function getRectFromBox(box: {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}) {
  return DOMRect.fromRect({
    height: box.height,
    width: box.width,
    x: box.left,
    y: box.top,
  });
}

function rectsIntersect(a: DOMRect, b: DOMRect) {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
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

// ─── SlingShotRoot ────────────────────────────────────────────────────────────

function SlingShotRoot({
  boundsRef,
  children,
  className,
  config,
  disabled,
  onGoalHit,
  onLand,
  onLaunch,
  resetKey,
  ...props
}: SlingShotProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef(new Map<string, ItemPhysicsState>());
  const goalsRef = React.useRef(new Map<string, SlingShotGoalRegistration>());
  // Maps pointerId → itemId for active drags
  const activePointersRef = React.useRef(new Map<number, string>());

  const resolvedConfig = React.useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config],
  );

  // Incrementing this causes context consumers to re-render and read fresh physics state
  const [renderTick, setRenderTick] = React.useState(0);
  const forceRender = React.useCallback(() => setRenderTick((t) => t + 1), []);

  // Active aiming state exposed to Arrow / Preview / Power
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const [activeState, setActiveState] = React.useState<SlingShotState | null>(null);

  // ── Item registration ────────────────────────────────────────────────────

  const registerItem = React.useCallback((id: string, element: HTMLElement) => {
    if (!itemsRef.current.has(id)) {
      itemsRef.current.set(id, createItemState());
    }
    const s = itemsRef.current.get(id)!;
    s.element = element;

    return () => {
      const item = itemsRef.current.get(id);
      if (item) {
        if (item.frameId !== null) cancelAnimationFrame(item.frameId);
        if (item.shakeFrameId !== null) cancelAnimationFrame(item.shakeFrameId);
        if (item.pointerId !== null) {
          activePointersRef.current.delete(item.pointerId);
        }
      }
      itemsRef.current.delete(id);
    };
  }, []);

  // ── Shake ────────────────────────────────────────────────────────────────

  const stopShake = React.useCallback(
    (itemId: string) => {
      const item = itemsRef.current.get(itemId);
      if (!item) return;
      if (item.shakeFrameId !== null) {
        cancelAnimationFrame(item.shakeFrameId);
        item.shakeFrameId = null;
      }
      item.shakeOffset = ZERO_VECTOR;
      forceRender();
    },
    [forceRender],
  );

  const startShake = React.useCallback(
    (itemId: string) => {
      const item = itemsRef.current.get(itemId);
      if (!item || !resolvedConfig.shake || item.shakeFrameId !== null) return;

      const tick = () => {
        const it = itemsRef.current.get(itemId);
        if (!it || !it.isAiming) {
          if (it) {
            it.shakeFrameId = null;
            it.shakeOffset = ZERO_VECTOR;
          }
          forceRender();
          return;
        }
        const amplitude = it.power * resolvedConfig.shakeIntensity;
        it.shakeOffset = {
          x: (Math.random() - 0.5) * amplitude,
          y: (Math.random() - 0.5) * amplitude,
        };
        it.shakeFrameId = requestAnimationFrame(tick);
        forceRender();
      };

      item.shakeFrameId = requestAnimationFrame(tick);
    },
    [forceRender, resolvedConfig.shake, resolvedConfig.shakeIntensity],
  );

  // ── Flight cancellation / reset ──────────────────────────────────────────

  const cancelFlight = React.useCallback((itemId: string) => {
    const item = itemsRef.current.get(itemId);
    if (!item || item.frameId === null) return;
    cancelAnimationFrame(item.frameId);
    item.frameId = null;
  }, []);

  const clearAimState = React.useCallback(
    (itemId: string) => {
      const item = itemsRef.current.get(itemId);
      if (!item) return;
      if (item.pointerId !== null) {
        activePointersRef.current.delete(item.pointerId);
      }
      item.pointerId = null;
      item.captureElement = null;
      item.isAiming = false;
      item.position = item.basePosition;
      item.rotation = item.baseRotation;
      item.pullVector = ZERO_VECTOR;
      item.power = 0;
      setActiveItemId(null);
      setActiveState(null);
      forceRender();
    },
    [forceRender],
  );

  // ── Aiming state updater (called every moveDrag) ─────────────────────────

  const setAimingStateForItem = React.useCallback(
    (itemId: string, pullVector: Vector) => {
      const item = itemsRef.current.get(itemId);
      const root = rootRef.current;
      if (!item) return;

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
        x: item.itemStartCenter.x + pullVector.x,
        y: item.itemStartCenter.y + pullVector.y,
      };
      const previewPoints = getPreviewPoints({
        gravity: resolvedConfig.gravity,
        previewStepMs: resolvedConfig.previewStepMs,
        previewSteps: resolvedConfig.previewSteps,
        start: itemCenter,
        velocity,
      });

      item.pullVector = pullVector;
      item.power = power;
      item.position = {
        x: item.basePosition.x + pullVector.x,
        y: item.basePosition.y + pullVector.y,
      };
      item.rotation = pullVector.x * resolvedConfig.rotation;

      setActiveState({
        aimAngle: Math.atan2(launchVector.y, launchVector.x),
        isAiming: item.isAiming,
        isFlying: false,
        itemCenter: root ? itemCenter : ZERO_VECTOR,
        launchVector,
        power,
        previewPoints,
        pullVector,
        velocity,
      });
      forceRender();
    },
    [forceRender, resolvedConfig],
  );

  // ── Goal registration & hit detection ───────────────────────────────────

  const registerGoal = React.useCallback((goal: SlingShotGoalRegistration) => {
    goalsRef.current.set(goal.id, goal);
    return () => {
      goalsRef.current.delete(goal.id);
    };
  }, []);

  const detectGoalHits = React.useCallback(
    ({
      itemId,
      item,
      itemRect,
      velocity,
    }: {
      itemId: string;
      item: HTMLElement;
      itemRect: DOMRect;
      velocity: Vector;
    }) => {
      const it = itemsRef.current.get(itemId);
      if (!it) return;

      goalsRef.current.forEach((goal) => {
        if (it.hitGoalIds.has(goal.id)) return;

        const goalRect = goal.element.getBoundingClientRect();
        const hitEvent: SlingShotHitEvent = {
          goalElement: goal.element,
          goalId: goal.id,
          goalRect,
          itemElement: item,
          itemId,
          itemRect,
          velocity,
        };
        const isHit =
          goal.hitTest?.(hitEvent) ?? rectsIntersect(itemRect, goalRect);

        if (!isHit) return;

        it.hitGoalIds.add(goal.id);
        goal.notifyHit(hitEvent);
        onGoalHit?.(hitEvent);
      });
    },
    [onGoalHit],
  );

  // ── Flight simulation ─────────────────────────────────────────────────────

  const startFlight = React.useCallback(
    (itemId: string, pullVector: Vector) => {
      const item = itemsRef.current.get(itemId);
      if (!item?.element) return;
      const element = item.element;

      const currentRect = element.getBoundingClientRect();
      const layoutRect = {
        left: currentRect.left - item.position.x,
        top: currentRect.top - item.position.y,
        width: currentRect.width,
        height: currentRect.height,
      };

      item.velocity = {
        x: -pullVector.x * resolvedConfig.power,
        y: -pullVector.y * resolvedConfig.power,
      };
      item.isFlying = true;
      item.hitGoalIds.clear();

      onLaunch?.(item.velocity, itemId);
      setActiveItemId(null);
      setActiveState(null);
      forceRender();

      const bounds = getBounds(boundsRef?.current ?? null);
      const minX = bounds.left - layoutRect.left;
      const maxX = bounds.right - layoutRect.left - layoutRect.width;
      const minY = bounds.top - layoutRect.top;
      const groundY = bounds.bottom - layoutRect.top - layoutRect.height;
      let bounceCount = 0;
      let lastTime = performance.now();

      const tick = (time: number) => {
        const it = itemsRef.current.get(itemId);
        if (!it) return; // item was unregistered (e.g. archived)

        const dt = Math.min((time - lastTime) / 1000, 0.032);
        lastTime = time;

        const velocity = it.velocity;
        const current = it.position;
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
            const settledVelocity = ZERO_VECTOR;
            const settledItemRect = getRectFromBox({
              bottom: layoutRect.top + settledPosition.y + layoutRect.height,
              height: layoutRect.height,
              left: layoutRect.left + settledPosition.x,
              right:
                layoutRect.left + settledPosition.x + layoutRect.width,
              top: layoutRect.top + settledPosition.y,
              width: layoutRect.width,
            });

            it.position = settledPosition;
            it.velocity = settledVelocity;
            it.isFlying = false;
            it.rotation = settledPosition.x * resolvedConfig.rotation;
            it.frameId = null;

            detectGoalHits({
              itemId,
              item: element,
              itemRect: settledItemRect,
              velocity: settledVelocity,
            });
            forceRender();
            onLand?.({
              itemId,
              position: settledPosition,
              velocity: settledVelocity,
            });
            return;
          }
        }

        const nextPosition = { x: nextX, y: nextY };
        const nextVelocity = { x: nextVx, y: nextVy };
        const nextItemRect = getRectFromBox({
          bottom: layoutRect.top + nextY + layoutRect.height,
          height: layoutRect.height,
          left: layoutRect.left + nextX,
          right: layoutRect.left + nextX + layoutRect.width,
          top: layoutRect.top + nextY,
          width: layoutRect.width,
        });

        it.position = nextPosition;
        it.velocity = nextVelocity;
        it.rotation += nextVx * dt * resolvedConfig.rotation;

        detectGoalHits({
          itemId,
          item: element,
          itemRect: nextItemRect,
          velocity: nextVelocity,
        });
        forceRender();
        it.frameId = requestAnimationFrame(tick);
      };

      item.frameId = requestAnimationFrame(tick);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boundsRef, detectGoalHits, forceRender, onLand, onLaunch, resolvedConfig],
  );

  // ── Drag lifecycle ────────────────────────────────────────────────────────

  const beginDrag = React.useCallback(
    (
      itemId: string,
      pointerId: number,
      clientX: number,
      clientY: number,
      target: HTMLElement,
    ) => {
      const item = itemsRef.current.get(itemId);
      const root = rootRef.current;

      if (!item || !item.element || !root || disabled || item.isFlying) return;

      cancelFlight(itemId);
      item.pointerId = pointerId;
      item.captureElement = target;
      item.pointerStart = { x: clientX, y: clientY };
      item.basePosition = item.position;
      item.baseRotation = item.rotation;
      activePointersRef.current.set(pointerId, itemId);

      const itemRect = item.element.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      item.itemStartCenter = {
        x: itemRect.left - rootRect.left + itemRect.width / 2,
        y: itemRect.top - rootRect.top + itemRect.height / 2,
      };
    },
    [cancelFlight, disabled],
  );

  const moveDrag = React.useCallback(
    (pointerId: number, clientX: number, clientY: number) => {
      const itemId = activePointersRef.current.get(pointerId);
      if (!itemId) return false;
      const item = itemsRef.current.get(itemId);
      if (!item || item.pointerId !== pointerId) return false;

      const rawVector = {
        x: clientX - item.pointerStart.x,
        y: clientY - item.pointerStart.y,
      };

      if (!item.isAiming) {
        const distance = Math.hypot(rawVector.x, rawVector.y);
        if (distance < resolvedConfig.startDragDistance) return false;

        item.isAiming = true;
        setActiveItemId(itemId);
        startShake(itemId);
      }

      setAimingStateForItem(itemId, limitVector(rawVector, resolvedConfig.maxPull));
      return true;
    },
    [
      resolvedConfig.maxPull,
      resolvedConfig.startDragDistance,
      setAimingStateForItem,
      startShake,
    ],
  );

  const endDrag = React.useCallback(
    (pointerId: number) => {
      const itemId = activePointersRef.current.get(pointerId);
      if (!itemId) return false;
      const item = itemsRef.current.get(itemId);
      if (!item || item.pointerId !== pointerId) return false;

      const shouldLaunch = item.isAiming;
      const pullVector = { ...item.pullVector };

      stopShake(itemId);

      if (!shouldLaunch || Math.hypot(pullVector.x, pullVector.y) < 8) {
        clearAimState(itemId);
        return false;
      }

      // Clear drag tracking without resetting position
      activePointersRef.current.delete(pointerId);
      item.pointerId = null;
      item.captureElement = null;
      item.isAiming = false;
      item.pullVector = ZERO_VECTOR;
      item.power = 0;

      startFlight(itemId, pullVector);
      return true;
    },
    [clearAimState, startFlight, stopShake],
  );

  // ── Reset on key change ───────────────────────────────────────────────────

  React.useEffect(() => {
    itemsRef.current.forEach((item, id) => {
      if (item.frameId !== null) cancelAnimationFrame(item.frameId);
      if (item.shakeFrameId !== null) cancelAnimationFrame(item.shakeFrameId);
      const reset = createItemState();
      reset.element = item.element; // keep element reference
      itemsRef.current.set(id, reset);
    });
    activePointersRef.current.clear();
    setActiveItemId(null);
    setActiveState(null);
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  React.useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.frameId !== null) cancelAnimationFrame(item.frameId);
        if (item.shakeFrameId !== null) cancelAnimationFrame(item.shakeFrameId);
      });
    };
  }, []);

  // ── Window-level pointer listeners (always active) ───────────────────────

  React.useEffect(() => {
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

    const handleWindowBlur = () => {
      activePointersRef.current.forEach((itemId) => clearAimState(itemId));
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
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerRelease);
      window.removeEventListener("pointercancel", handleWindowPointerRelease);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [clearAimState, endDrag, moveDrag]);

  // ── Item pointer event handlers (forwarded from SlingShotItem) ───────────

  const handlePointerDown = React.useCallback(
    (itemId: string, event: React.PointerEvent<HTMLElement>) => {
      beginDrag(
        itemId,
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
    (_itemId: string, event: React.PointerEvent<HTMLElement>) => {
      if (moveDrag(event.pointerId, event.clientX, event.clientY)) {
        event.preventDefault();
      }
    },
    [moveDrag],
  );

  const handlePointerRelease = React.useCallback(
    (itemId: string, event: React.PointerEvent<HTMLElement>) => {
      const item = itemsRef.current.get(itemId);
      try {
        if (item?.captureElement?.hasPointerCapture(event.pointerId)) {
          item.captureElement.releasePointerCapture(event.pointerId);
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

  // ── Per-item transform / state getters (stable refs; context tick forces re-read) ─

  const getItemTransform = React.useCallback(
    (id: string) => {
      const item = itemsRef.current.get(id);
      return {
        position: item?.position ?? ZERO_VECTOR,
        rotation: item?.rotation ?? 0,
        shakeOffset: item?.shakeOffset ?? ZERO_VECTOR,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderTick],
  );

  const getItemState = React.useCallback(
    (id: string) => {
      const item = itemsRef.current.get(id);
      return {
        isAiming: item?.isAiming ?? false,
        isFlying: item?.isFlying ?? false,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderTick],
  );

  // ── Children rendering ────────────────────────────────────────────────────

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
      activeItemId,
      activeState,
      disabled,
      getItemState,
      getItemTransform,
      onPointerCancel: handlePointerRelease,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerRelease,
      registerGoal,
      registerItem,
    }),
    [
      activeItemId,
      activeState,
      disabled,
      getItemState,
      getItemTransform,
      handlePointerDown,
      handlePointerMove,
      handlePointerRelease,
      registerGoal,
      registerItem,
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

// ─── SlingShotSlot ────────────────────────────────────────────────────────────

export interface SlingShotSlotProps extends React.ComponentProps<"div"> {
  render?: (props: SlingShotState) => React.ReactNode;
}

function SlingShotSlot({ render, children, ...props }: SlingShotSlotProps) {
  const { activeState } = useSlingShotContext();
  const state = activeState ?? FALLBACK_SLING_STATE;
  return typeof render !== "undefined" ? (
    <Slot.Root {...props}>{render(state)}</Slot.Root>
  ) : (
    <div {...props}>{children}</div>
  );
}

// ─── SlingShotItem ────────────────────────────────────────────────────────────

export interface SlingShotItemProps extends SlingShotSlotProps {
  id?: string;
}

function SlingShotItem({
  className,
  id: idProp,
  ref,
  render,
  style,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  ...props
}: SlingShotItemProps) {
  const fallbackId = React.useId();
  const id = idProp ?? fallbackId;
  const context = useSlingShotContext();

  const { position, rotation, shakeOffset } = context.getItemTransform(id);
  const { isAiming } = context.getItemState(id);

  const itemRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (node) context.registerItem(id, node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const transform = `translate3d(${position.x + shakeOffset.x}px, ${position.y + shakeOffset.y}px, 0) rotate(${rotation}deg)`;

  return (
    <SlingShotSlot
      render={render}
      data-slot="sling-shot-item"
      ref={
        composeRefs(
          itemRef as React.Ref<HTMLDivElement>,
          ref as React.Ref<HTMLElement>,
        ) as React.Ref<HTMLDivElement>
      }
      className={cn(
        "relative z-10 inline-block touch-none will-change-transform",
        isAiming ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      style={{ ...style, transform }}
      onPointerCancel={composeEventHandlers(onPointerCancel, (e) =>
        context.onPointerCancel(id, e),
      )}
      onPointerDown={composeEventHandlers(onPointerDown, (e) =>
        context.onPointerDown(id, e),
      )}
      onPointerMove={composeEventHandlers(onPointerMove, (e) =>
        context.onPointerMove(id, e),
      )}
      onPointerUp={composeEventHandlers(onPointerUp, (e) =>
        context.onPointerUp(id, e),
      )}
      {...props}
    />
  );
}

// ─── SlingShotGoal ────────────────────────────────────────────────────────────

export interface SlingShotGoalProps extends React.ComponentProps<"div"> {
  render?: (props: SlingShotGoalState) => React.ReactNode;
  hitTest?: (event: SlingShotHitEvent) => boolean;
  onHit?: (event: SlingShotHitEvent) => void;
}

function SlingShotGoal({
  ref,
  className,
  children,
  hitTest,
  onHit,
  render,
  ...props
}: SlingShotGoalProps) {
  const { registerGoal } = useSlingShotContext();
  const fallbackId = React.useId();
  const goalRef = React.useRef<HTMLDivElement | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const [goalState, setGoalState] = React.useState<SlingShotGoalState>({
    hitCount: 0,
    isHit: false,
    lastHit: null,
  });

  const notifyHit = React.useCallback(
    (event: SlingShotHitEvent) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      setGoalState((value) => ({
        hitCount: value.hitCount + 1,
        isHit: true,
        lastHit: event,
      }));
      onHit?.(event);

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setGoalState((value) => ({ ...value, isHit: false }));
      }, 420);
    },
    [onHit],
  );

  React.useEffect(() => {
    const element = goalRef.current;

    if (!element) return;

    return registerGoal({
      element,
      hitTest,
      id: props.id ?? fallbackId,
      notifyHit,
    });
  }, [fallbackId, hitTest, notifyHit, props.id, registerGoal]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (render) {
    return (
      <Slot.Root
        data-slot="sling-shot-goal"
        ref={composeRefs(goalRef, ref)}
        {...props}
      >
        {render(goalState)}
      </Slot.Root>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes sling-shot-goal-hit {
            0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
            18% { transform: translate3d(-3px, 1px, 0) rotate(-2deg); }
            36% { transform: translate3d(3px, -1px, 0) rotate(2deg); }
            54% { transform: translate3d(-2px, -1px, 0) rotate(-1deg); }
            72% { transform: translate3d(2px, 1px, 0) rotate(1deg); }
          }
        `}
      </style>
      <div
        data-slot="sling-shot-goal"
        ref={composeRefs(goalRef, ref)}
        className={cn(
          "relative inline-block transition-[filter]",
          goalState.isHit &&
            "pointer-events-none animate-[sling-shot-goal-hit_420ms_ease-out] ring-2 ring-red/60 ring-offset-1",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

// ─── SlingShotPower ───────────────────────────────────────────────────────────

function SlingShotPower({
  className,
  style,
  render,
  ...props
}: SlingShotSlotProps) {
  const { activeState } = useSlingShotContext();
  if (!activeState?.isAiming) return null;

  const value = Math.round(activeState.power * 100);

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
        left: activeState.itemCenter.x,
        top: activeState.itemCenter.y - 32,
        transform: "translateX(-50%)",
        ...style,
      }}
      {...props}
    >
      <div className="relative h-1 min-h-1 w-full overflow-hidden rounded-full bg-default/10">
        <div
          className="absolute h-full rounded-full"
          style={{
            backgroundColor: COLOR.orange.hex,
            opacity: 0.3,
            width: `calc(${value}% + 2px)`,
          }}
        />
        <div
          className="absolute h-full rounded-full"
          style={{
            backgroundColor: COLOR.orange.hex,
            width: `${value}%`,
          }}
        />
      </div>
    </SlingShotSlot>
  );
}

// ─── SlingShotArrow ───────────────────────────────────────────────────────────

function SlingShotArrow({
  className,
  style,
  render,
  ...props
}: SlingShotSlotProps) {
  const { activeState } = useSlingShotContext();
  if (!activeState?.isAiming || activeState.power === 0) return null;

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
        left: activeState.itemCenter.x,
        top: activeState.itemCenter.y,
        transform: `rotate(${activeState.aimAngle}rad)`,
        transformOrigin: "0 50%",
        width: 36 + activeState.power * 84,
        ...style,
      }}
      {...props}
    >
      <div className="absolute top-1/2 right-0 size-3 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-blue" />
    </SlingShotSlot>
  );
}

// ─── SlingShotPreview ─────────────────────────────────────────────────────────

export interface SlingShotPreviewProps extends SlingShotSlotProps {
  dotClassName?: string;
}

function SlingShotPreview({
  className,
  dotClassName,
  render,
  ...props
}: SlingShotPreviewProps) {
  const { activeState } = useSlingShotContext();
  if (!activeState?.isAiming || activeState.previewPoints.length === 0)
    return null;

  return (
    <SlingShotSlot
      render={render}
      data-slot="sling-shot-preview"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-20", className)}
      {...props}
    >
      {activeState.previewPoints.map((point, index) => (
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
SlingShotGoal.__slingShotSlot = "goal";
SlingShotPower.__slingShotSlot = "power";
SlingShotArrow.__slingShotSlot = "arrow";
SlingShotPreview.__slingShotSlot = "preview";

export const SlingShot = Object.assign(SlingShotRoot, {
  Arrow: SlingShotArrow,
  Goal: SlingShotGoal,
  Item: SlingShotItem,
  Power: SlingShotPower,
  Preview: SlingShotPreview,
});
