import * as React from "react";
import { useAnimate } from "framer-motion";
import { Slot } from "radix-ui";
import { useHotkeys } from "react-hotkeys-hook";

import { cn } from "@notion-kit/cn";

export type EjectTrigger =
  | "onClick"
  | "onContextMenu"
  | "onPointerDown"
  | "onMouseDown"
  | "onTouchStart"
  | "onBlur";
export type EjectMode = "disappear" | "respawn" | "ghost";
export interface EjectConfig {
  /**
   * Multiplier for the ejection force.
   * @default 1
   */
  force?: number;
  /**
   * Duration of the animation.
   * @default 1.2
   */
  duration?: number;
  /**
   * Horizontal velocity.
   * @default 400
   */
  vx?: number;
  /**
   * Maximum vertical distance.
   * @default 300
   */
  maxY?: number;
  /**
   * Rotation angle.
   * @default 360
   */
  rotate?: number;
  /**
   * Scale target.
   * @default 0.5
   */
  scaleTarget?: number;
}

export interface EjectRef {
  eject: () => void;
}

export interface EjectProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  /**
   * Behavior after ejection.
   * "disappear" - Flies away and sets display: none
   * "respawn" - Flies away and comes back (resets) after a delay
   * "ghost" - Flies away but leaves a hidden ghost behind so layout doesn't collapse
   * @default "respawn"
   */
  mode?: EjectMode;
  /**
   * Event triggers that will cause the ejection.
   * @default ["onClick"]
   */
  triggers?: EjectTrigger[] | null;
  /**
   * Keyboard shortcut to trigger ejection.
   */
  shortcut?: string;
  /**
   * Ejection configuration.
   */
  config?: EjectConfig;
}

export const Eject = React.forwardRef<EjectRef, EjectProps>(function Eject(
  {
    asChild,
    mode = "respawn",
    triggers = ["onClick"],
    shortcut,
    config,
    className,
    style,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot.Root : "div";

  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [ejected, setEjected] = React.useState(false);
  const [renderKey, setRenderKey] = React.useState(0);
  const [respawning, setRespawning] = React.useState(false);

  const resolvedTriggers = React.useMemo(
    () => new Set(triggers ?? []),
    [triggers],
  );
  const resolvedConfig = React.useMemo(() => {
    return {
      ...config,
      force: config?.force ?? 1,
      duration: config?.duration ?? 1.2,
      vx: config?.vx ?? 400,
      maxY: config?.maxY ?? 300,
      rotate: config?.rotate ?? 360,
      scaleTarget: config?.scaleTarget ?? 0.5,
    };
  }, [config]);

  const triggerEject = React.useCallback(async () => {
    if (ejected) return;
    setEjected(true);

    const calcVelocityX = (Math.random() - 0.5) * resolvedConfig.vx;
    const calcPeakY = -(
      resolvedConfig.maxY +
      Math.random() * (resolvedConfig.maxY * 0.3)
    );

    // Rotation within +/- specified degrees
    const calcRotateTarget = (Math.random() - 0.5) * resolvedConfig.rotate;

    const totalDuration = resolvedConfig.duration;
    const upwardDuration = totalDuration * 0.25;
    const downwardDuration = totalDuration * 0.75;

    // Start concurrent animations for x, rotate, and scale
    void animate(
      scope.current,
      {
        x: calcVelocityX,
        rotate: calcRotateTarget,
        scale: [1, resolvedConfig.scaleTarget],
      },
      { duration: totalDuration, ease: "linear" },
    );

    // Upward phase
    await animate(
      scope.current,
      { y: [0, calcPeakY] },
      { duration: upwardDuration, ease: "circOut" },
    );

    // Downward phase
    await animate(
      scope.current,
      { y: [calcPeakY, 2000] },
      { duration: downwardDuration, ease: "circIn" },
    );

    switch (mode) {
      case "respawn":
        // Wait a bit, then remount to reset component state
        setTimeout(() => {
          setRespawning(true);
          setRenderKey((k) => k + 1);
        }, 1000);
        break;
      case "disappear":
        // eslint-disable-next-line react-hooks/immutability
        scope.current.style.display = "none";
        break;
      case "ghost":
        scope.current.style.visibility = "hidden";
        // To maintain layout without it actually transforming layout,
        // we reset scale/rotation/translation to avoid shrinking the bounding box
        await animate(
          scope.current,
          {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 0,
          },
          { duration: 0 },
        );
        break;
    }
  }, [ejected, resolvedConfig, animate, scope, mode]);

  React.useImperativeHandle(ref, () => ({ eject: triggerEject }), [
    triggerEject,
  ]);

  const listeners = React.useMemo(() => {
    return Array.from(resolvedTriggers).reduce((acc, trigger) => {
      acc[trigger] = (e: React.SyntheticEvent) => {
        props[trigger]?.(e as never);
        if (resolvedTriggers.has(trigger)) {
          void triggerEject();
        }
      };
      return acc;
    }, {} as React.ComponentProps<"div">);
  }, [props, resolvedTriggers, triggerEject]);

  // Bind keyboard shortcut
  useHotkeys(
    shortcut ?? "",
    (e) => {
      e.preventDefault();
      void triggerEject();
    },
    { enabled: !!shortcut },
  );

  // Handle respawn animation after remount
  React.useEffect(() => {
    if (!respawning) return;

    // eslint-disable-next-line react-hooks/immutability
    scope.current.style.maskImage =
      "linear-gradient(to bottom right, black 40%, transparent 60%)";
    scope.current.style.maskSize = "300% 300%";
    scope.current.style.maskPosition = "100% 100%";

    void animate(
      scope.current,
      {
        opacity: 1,
        maskPosition: "0% 0%",
      },
      {
        duration: 1,
        ease: "circOut",
      },
    ).then(() => {
      scope.current.style.maskImage = "";
      scope.current.style.maskSize = "";
      scope.current.style.maskPosition = "";

      setRespawning(false);
      setEjected(false);
    });
  }, [respawning, renderKey, animate, scope]);

  return (
    <Comp
      key={renderKey}
      ref={scope}
      className={cn("relative", className)}
      style={{
        ...style,
        ...(respawning ? { opacity: 0 } : {}),
      }}
      {...props}
      {...listeners}
    />
  );
});
