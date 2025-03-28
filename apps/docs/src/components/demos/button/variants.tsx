import { Button } from "@notion-kit/shadcn";

const variants = [
  "primary",
  "hint",
  "blue",
  "soft-blue",
  "red",
  "red-fill",
  "link",
] as const;

export default function Demo() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {variants.map((variant) => (
        <Button key={variant} variant={variant} size="md">
          Button
        </Button>
      ))}
    </div>
  );
}
