import { Checkbox } from "@notion-kit/shadcn";

const sizes = ["xs", "sm", "md"] as const;

export default function Sizes() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sizes.map((size) => (
        <Checkbox key={size} size={size} />
      ))}
    </div>
  );
}
