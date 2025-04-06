import { IconBlock } from "@notion-kit/icon-block";

const sizes = ["sm", "md", "lg", "xl"] as const;

export default function Demo() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sizes.map((size) => (
        <IconBlock
          key={size}
          size={size}
          icon={{ type: "emoji", emoji: "🚀" }}
        />
      ))}
    </div>
  );
}
