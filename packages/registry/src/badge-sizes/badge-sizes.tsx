import { Badge } from "@notion-kit/ui/primitives";

const sizes = ["sm", "md"] as const;

export default function Sizes() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sizes.map((size) => (
        <Badge key={size} size={size}>
          badge
        </Badge>
      ))}
    </div>
  );
}
