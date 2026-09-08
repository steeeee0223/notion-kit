import { cn } from "@notion-kit/cn";

interface SelectionEdges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const EDGE_MASKS = {
  top: "linear-gradient(to bottom, black 2px, transparent 2px)",
  right: "linear-gradient(to left, black 2px, transparent 2px)",
  bottom: "linear-gradient(to top, black 2px, transparent 2px)",
  left: "linear-gradient(to right, black 2px, transparent 2px)",
};

/** Keep the original focus shadow, revealing only the perimeter of a range. */
export function CellSelectionOverlay({ edges }: { edges: SelectionEdges }) {
  const sides = (Object.keys(EDGE_MASKS) as (keyof SelectionEdges)[]).filter(
    (side) => edges[side],
  );
  const single = sides.length === 4;
  const corners = cn(
    edges.top && edges.left && "rounded-tl-sm",
    edges.top && edges.right && "rounded-tr-sm",
    edges.bottom && edges.left && "rounded-bl-sm",
    edges.bottom && edges.right && "rounded-br-sm",
  );
  return (
    <div
      data-cell-selection-overlay=""
      data-cell-selection-outline={single ? "" : undefined}
      data-selection-edges={sides.join(" ")}
      className={cn(
        "pointer-events-none absolute top-0 left-0 z-(--z-col) size-full bg-blue/5",
        single ? "rounded-sm shadow-cell-focus" : corners,
      )}
    >
      {!single && sides.length > 0 && (
        <div
          data-cell-selection-outline=""
          className={cn("absolute inset-0 shadow-cell-focus", corners)}
          style={{
            maskImage: sides.map((side) => EDGE_MASKS[side]).join(", "),
          }}
        />
      )}
    </div>
  );
}
