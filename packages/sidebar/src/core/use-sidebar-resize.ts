import React, { useCallback, useEffect, useRef } from "react";

interface UseSidebarResizeProps {
  enableDrag?: boolean;
  onResize: (width: string) => void;
  onToggle: () => void;
  currentWidth: string;
  isCollapsed: boolean;
  minResizeWidth: string;
  maxResizeWidth: string;
  setIsDraggingRail: (isDraggingRail: boolean) => void;
  cookieName: string;
  cookieMaxAge: number;
}

export function useSidebarResize({
  enableDrag = true,
  setIsDraggingRail,
  onResize,
  onToggle,
  currentWidth,
  isCollapsed,
  minResizeWidth,
  maxResizeWidth,
  cookieName,
  cookieMaxAge,
}: UseSidebarResizeProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const isInteractingWithRail = useRef(false);
  const lastWidth = useRef(0);
  const lastLoggedWidth = useRef(0);
  const autoCollapseThreshold = useRef(toPx(minResizeWidth) * 0.55); // 55% of min width

  const persistWidth = useCallback(
    (width: string) => {
      document.cookie = `${cookieName}=${width}; path=/; max-age=${cookieMaxAge}`;
    },
    [cookieName, cookieMaxAge],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isInteractingWithRail.current = true;

      if (!enableDrag || isCollapsed) {
        // console.log("[Rail] Click only mode - collapsed or drag disabled");
        return;
      }

      startWidth.current = toPx(currentWidth);
      startX.current = e.clientX;
      lastWidth.current = startWidth.current;
      lastLoggedWidth.current = startWidth.current;

      // console.log(`[Rail] Started at ${currentWidth}`);
      e.preventDefault();
    },
    [enableDrag, isCollapsed, currentWidth],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInteractingWithRail.current || isCollapsed) return;

      const deltaX = Math.abs(e.clientX - startX.current);
      if (!isDragging.current && deltaX > 5) {
        isDragging.current = true;
        // console.log("[Rail] Started dragging");
        setIsDraggingRail(true);
      }

      if (isDragging.current) {
        const { unit } = parseWidth(currentWidth);
        const minWidthPx = toPx(minResizeWidth);
        const maxWidthPx = toPx(maxResizeWidth);

        // Calculate new width in pixels
        const deltaWidth = e.clientX - startX.current;
        const newWidthPx = startWidth.current + deltaWidth;

        // Auto-collapse if dragged below threshold
        if (newWidthPx < autoCollapseThreshold.current) {
          onToggle();
          isDragging.current = false;
          isInteractingWithRail.current = false;
          setIsDraggingRail(false);
          return;
        }

        // Rest of the existing width calculation logic
        const clampedWidthPx = Math.max(
          minWidthPx,
          Math.min(maxWidthPx, newWidthPx),
        );

        // Convert to the target unit if needed
        const newWidth = unit === "rem" ? clampedWidthPx / 16 : clampedWidthPx;

        // Use appropriate threshold based on unit
        const threshold = unit === "rem" ? 0.1 : 1;
        if (
          Math.abs(newWidth - lastWidth.current / (unit === "rem" ? 16 : 1)) >=
          threshold
        ) {
          const formattedWidth = formatWidth(newWidth, unit);
          onResize(formattedWidth);
          persistWidth(formattedWidth); // Store width in cookie when it changes
          lastWidth.current = clampedWidthPx; // Store in px for consistent comparisons

          // Log on larger changes
          const logThreshold = unit === "rem" ? 1 : 16;
          if (
            Math.abs(
              newWidth - lastLoggedWidth.current / (unit === "rem" ? 16 : 1),
            ) >= logThreshold
          ) {
            // console.log(`[Rail] Width: ${formattedWidth}`);
            lastLoggedWidth.current = clampedWidthPx;
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (!isInteractingWithRail.current) return;

      if (!isDragging.current) {
        // console.log("[Rail] Clicked, toggling sidebar");
        onToggle();
      } else {
        // console.log(`[Rail] Finished at ${currentWidth}`);
      }

      isDragging.current = false;
      isInteractingWithRail.current = false;
      lastWidth.current = 0;
      lastLoggedWidth.current = 0;
      setIsDraggingRail(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    onResize,
    onToggle,
    isCollapsed,
    currentWidth,
    minResizeWidth,
    maxResizeWidth,
    persistWidth,
    setIsDraggingRail,
  ]);

  return {
    dragRef,
    isDragging,
    handleMouseDown,
  };
}

function parseWidth(width: string): { value: number; unit: "rem" | "px" } {
  const unit = width.endsWith("rem") ? "rem" : "px";
  const value = Number.parseFloat(width);
  return { value, unit };
}

// Convert any width to pixels for calculations
function toPx(width: string): number {
  const { value, unit } = parseWidth(width);
  return unit === "rem" ? value * 16 : value;
}

function formatWidth(value: number, unit: "rem" | "px"): string {
  return `${unit === "rem" ? value.toFixed(1) : Math.round(value)}${unit}`;
}
