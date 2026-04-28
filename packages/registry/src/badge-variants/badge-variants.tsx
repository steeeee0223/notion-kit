import { Badge } from "@notion-kit/shadcn";

const variants = ["default", "gray", "blue", "orange", "tag"] as const;

export default function Variants() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  );
}
