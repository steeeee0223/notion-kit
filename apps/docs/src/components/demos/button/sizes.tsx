import { Button } from "@notion-kit/shadcn";

const sizes = ["xs", "sm", "md", "lg"] as const;

export default function Demo() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sizes.map((size) => (
        <Button key={size} size={size}>
          Button
        </Button>
      ))}
    </div>
  );
}
