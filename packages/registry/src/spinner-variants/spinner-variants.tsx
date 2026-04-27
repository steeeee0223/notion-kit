import { Spinner } from "@notion-kit/shadcn";

const variants = ["solid", "dashed"] as const;

export default function Variants() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {variants.map((variant) => (
        <Spinner key={variant} variant={variant} />
      ))}
    </div>
  );
}
