import * as React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@notion-kit/cn";
import { Button } from "@notion-kit/ui/primitives";

// ─── Physics constants ─────────────────────────────────────────────────────
const G = 0.6; // gravity per frame
const BOUNCE = 0; // restitution
const FRICTION = 0.86; // horizontal friction on floor/wall bounce
const AIR_DRAG = 0.994; // per-frame velocity decay
const SIZE = 62; // logo tile size px
const HALF = SIZE / 2;

interface Body {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  av: number;
  settled: boolean;
  spawned: boolean;
  spawnAt: number;
  dragging?: boolean;
  dragStartX?: number;
  dragStartY?: number;
}

function makeBody(i: number, cw: number): Body {
  return {
    id: i,
    x: HALF + Math.random() * Math.max(cw - SIZE, 1),
    y: -HALF - i * 72,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 1.5,
    angle: (Math.random() - 0.5) * 0.5,
    av: (Math.random() - 0.5) * 0.1, // angular velocity
    settled: false,
    spawned: false,
    spawnAt: i * 130, // ms
  };
}

function collide(a: Body, b: Body, applyVelocity: boolean) {
  const ca = Math.cos(a.angle),
    sa = Math.sin(a.angle);
  const cb = Math.cos(b.angle),
    sb = Math.sin(b.angle);

  const axes = [
    { x: ca, y: sa },
    { x: -sa, y: ca },
    { x: cb, y: sb },
    { x: -sb, y: cb },
  ];

  let minOverlap = Infinity;
  let smallestAxis = { x: 0, y: 0 };

  const dx = b.x - a.x;
  const dy = b.y - a.y;

  for (const axis of axes) {
    const rA =
      HALF * Math.abs(ca * axis.x + sa * axis.y) +
      HALF * Math.abs(-sa * axis.x + ca * axis.y);
    const rB =
      HALF * Math.abs(cb * axis.x + sb * axis.y) +
      HALF * Math.abs(-sb * axis.x + cb * axis.y);

    const dist = Math.abs(dx * axis.x + dy * axis.y);
    const overlap = rA + rB - dist;

    if (overlap <= 0) return false;
    if (overlap < minOverlap) {
      minOverlap = overlap;
      smallestAxis = axis;
    }
  }

  if (dx * smallestAxis.x + dy * smallestAxis.y < 0) {
    smallestAxis.x *= -1;
    smallestAxis.y *= -1;
  }

  let wA = 0.5;
  let wB = 0.5;
  if (smallestAxis.y > 0.2) {
    wA = 1;
    wB = 0;
  } else if (smallestAxis.y < -0.2) {
    wA = 0;
    wB = 1;
  }

  if (a.dragging) {
    wA = 0;
    wB = 1;
  }
  if (b.dragging) {
    wA = 1;
    wB = 0;
  }
  if (a.dragging && b.dragging) {
    wA = 0;
    wB = 0;
  }

  const push = minOverlap;
  a.x -= smallestAxis.x * push * wA;
  a.y -= smallestAxis.y * push * wA;
  b.x += smallestAxis.x * push * wB;
  b.y += smallestAxis.y * push * wB;

  if (applyVelocity) {
    const dvx = b.vx - a.vx;
    const dvy = b.vy - a.vy;
    const vn = dvx * smallestAxis.x + dvy * smallestAxis.y;

    if (vn < 0) {
      const impulse = -vn;
      a.vx -= impulse * smallestAxis.x * wA;
      a.vy -= impulse * smallestAxis.y * wA;
      b.vx += impulse * smallestAxis.x * wB;
      b.vy += impulse * smallestAxis.y * wB;

      a.vx *= FRICTION;
      a.vy *= FRICTION;
      b.vx *= FRICTION;
      b.vy *= FRICTION;
    }
  }

  return true;
}

function computePhysicsStep(
  now: number,
  t0: number,
  bs: Body[],
  cw: number,
  ch: number,
) {
  const elapsed = now - t0;
  let anyLive = false;

  bs.forEach((b) => {
    if (!b.spawned && elapsed >= b.spawnAt) b.spawned = true;
    if (b.dragging) anyLive = true;
    if (!b.spawned || b.settled || b.dragging) return;
    anyLive = true;

    b.vy = (b.vy + G) * AIR_DRAG;
    b.vx *= AIR_DRAG;
    b.x += b.vx;
    b.y += b.vy;
    b.angle += b.av;
    b.av *= 0.96;
  });

  // 2. Iterative constraint solver
  for (let iter = 0; iter < 4; iter++) {
    // Box collisions
    for (let i = 0; i < bs.length - 1; i++) {
      for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i];
        const b = bs[j];
        if (!a || !b) continue;
        if (a.spawned && b.spawned && (!a.settled || !b.settled)) {
          if (collide(a, b, iter === 0)) {
            a.settled = false;
            b.settled = false;
            anyLive = true;
          }
        }
      }
    }

    // Boundaries
    bs.forEach((b) => {
      if (!b.spawned || b.dragging) return;

      const bound =
        HALF * Math.abs(Math.cos(b.angle)) + HALF * Math.abs(Math.sin(b.angle));

      // Floor
      if (b.y + bound >= ch) {
        b.y = ch - bound;
        if (iter === 0) {
          b.vy *= -BOUNCE;
          b.vx *= FRICTION;
          b.av *= 0.55;
        }
      }
      if (b.x - bound < 0) {
        b.x = bound;
        if (iter === 0) b.vx *= -BOUNCE;
      }
      if (b.x + bound > cw) {
        b.x = cw - bound;
        if (iter === 0) b.vx *= -BOUNCE;
      }
    });
  }

  // 3. Settle check
  bs.forEach((b) => {
    if (!b.spawned || b.dragging) return;

    if (
      Math.abs(b.vy) < 0.05 &&
      Math.abs(b.vx) < 0.1 &&
      Math.abs(b.av) < 0.001
    ) {
      b.settled = true;
      b.vy = 0;
      b.vx = 0;
      b.av = 0;
    }
  });

  return {
    anyLive,
    newFrames: bs.map((b) => ({ x: b.x, y: b.y, a: b.angle, on: b.spawned })),
  };
}

const FallingBlocksContext = createContext<{
  frames: { x: number; y: number; a: number; on: boolean }[];
  triggerReplay: () => void;
  setDragStart: (idx: number) => void;
  setDragMove: (idx: number, dx: number, dy: number) => void;
  setDragEnd: (idx: number, dx: number, dy: number) => void;
}>({
  frames: [],
  triggerReplay: () => {
    // default
  },
  setDragStart: () => {
    // default
  },
  setDragMove: () => {
    // default
  },
  setDragEnd: () => {
    // default
  },
});

export function useFallingBlocks() {
  return useContext(FallingBlocksContext);
}

export interface FallingBlocksRootProps extends React.ComponentProps<"div"> {
  runId?: number | string;
  count?: number;
}

function Root({
  children,
  ref,
  style,
  className,
  runId,
  count: countProp,
  ...props
}: FallingBlocksRootProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const bodiesRef = useRef<Body[]>([]);
  const [internalRunId, setInternalRunId] = useState(0);
  const effectiveRunId = runId ?? internalRunId;
  const prevRunId = useRef(effectiveRunId);
  const t0Ref = useRef(0);
  const dimsRef = useRef<{ w: number; h: number }>({ w: 640, h: 420 });
  const [started, setStarted] = useState(false);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [frames, setFrames] = useState<
    { x: number; y: number; a: number; on: boolean }[]
  >([]);

  const count = countProp ?? React.Children.count(children);

  // Measure width
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      if (!e) return;
      dimsRef.current = { w: e.contentRect.width, h: e.contentRect.height };
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Intersection → start
  useEffect(() => {
    if (!wrapRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setStarted(true);
      },
      { threshold: 0.25 },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  // Physics loop
  useEffect(() => {
    if (!started || count === 0) return;

    if (effectiveRunId !== prevRunId.current) {
      bodiesRef.current = [];
      prevRunId.current = effectiveRunId;
      t0Ref.current = performance.now();
    }

    const { w: cw, h: ch } = dimsRef.current;

    if (bodiesRef.current.length !== count) {
      bodiesRef.current = Array.from({ length: count }, (_, i) =>
        makeBody(i, cw),
      );
      t0Ref.current = performance.now();
    }

    const step = (now: number) => {
      const bs = bodiesRef.current;
      const { anyLive, newFrames } = computePhysicsStep(
        now,
        t0Ref.current,
        bs,
        cw,
        ch,
      );

      setFrames(newFrames);

      if (anyLive || bs.some((b) => !b.spawned)) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, count, effectiveRunId, activeDragId]);

  const setDragStart = React.useCallback((idx: number) => {
    const body = bodiesRef.current[idx];
    if (body) {
      body.dragging = true;
      body.settled = false;
      body.dragStartX = body.x;
      body.dragStartY = body.y;
      setActiveDragId(idx);
    }
  }, []);

  const setDragMove = React.useCallback(
    (idx: number, dx: number, dy: number) => {
      const body = bodiesRef.current[idx];
      if (body?.dragStartX !== undefined && body.dragStartY !== undefined) {
        body.x = body.dragStartX + dx;
        body.y = body.dragStartY + dy;
        body.vx = dx * 0.05;
        body.vy = dy * 0.05;
        body.settled = false;
      }
    },
    [],
  );

  const setDragEnd = React.useCallback(
    (idx: number, dx: number, dy: number) => {
      const body = bodiesRef.current[idx];
      if (body) {
        body.dragging = false;
        if (body.dragStartX !== undefined && body.dragStartY !== undefined) {
          body.x = body.dragStartX + dx;
          body.y = body.dragStartY + dy;
        }
        body.settled = false;
      }
      setActiveDragId(null);
    },
    [],
  );

  const triggerReplay = React.useCallback(() => {
    setInternalRunId((prev) => prev + 1);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      frames,
      triggerReplay,
      setDragStart,
      setDragMove,
      setDragEnd,
    }),
    [frames, triggerReplay, setDragStart, setDragMove, setDragEnd],
  );

  return (
    <div
      ref={(node) => {
        wrapRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn("group relative overflow-hidden", className)}
      style={style}
      {...props}
    >
      <FallingBlocksContext value={contextValue}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(
              child as React.ReactElement<{ physicsIndex?: number }>,
              { physicsIndex: index },
            );
          }
          return child;
        })}
      </FallingBlocksContext>

      {!started && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-[0.12em] text-[rgba(255,255,255,0.15)]">
          scroll to activate
        </div>
      )}
    </div>
  );
}

export interface FallingBlocksItemProps extends React.ComponentProps<"div"> {
  physicsIndex?: number;
  asChild?: boolean;
}

function Item({
  style,
  physicsIndex,
  className,
  asChild,
  ...props
}: FallingBlocksItemProps) {
  const { frames } = React.use(FallingBlocksContext);
  const f = physicsIndex !== undefined ? frames[physicsIndex] : null;

  if (!f?.on) return null;

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn("absolute will-change-[transform,left,top]", className)}
      style={{
        width: SIZE,
        height: SIZE,
        left: f.x - HALF,
        top: f.y - HALF,
        transform: `rotate(${f.a}rad)`,
        ...style,
      }}
      {...props}
    />
  );
}

export type FallingBlocksPlayButtonProps = React.ComponentProps<typeof Button>;

function PlayButton({ onClick, ...props }: FallingBlocksPlayButtonProps) {
  const { triggerReplay } = React.use(FallingBlocksContext);

  return (
    <Button
      variant="blue"
      size="sm"
      onClick={(e) => {
        triggerReplay();
        onClick?.(e);
      }}
      {...props}
    />
  );
}

export const FallingBlocks = { Root, Item, PlayButton };
