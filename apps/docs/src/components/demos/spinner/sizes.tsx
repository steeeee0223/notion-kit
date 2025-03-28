import { Spinner } from "@notion-kit/spinner";

const sizes = ["sm", "md", "lg"] as const;

export default function Sizes() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sizes.map((size) => (
        <Spinner key={size} size={size} />
      ))}
    </div>
  );
}
