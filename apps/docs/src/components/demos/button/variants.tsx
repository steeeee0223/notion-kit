import { Button } from "@notion-kit/shadcn";

const variants = ["primary", "secondary", "hint", "blue", "red"] as const;

export default function Demo() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          Button
        </Button>
      ))}
    </div>
  );
}
