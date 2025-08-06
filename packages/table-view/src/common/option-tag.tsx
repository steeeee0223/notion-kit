import { Badge } from "@notion-kit/shadcn";
import { COLOR, type Color } from "@notion-kit/utils";

interface OptionTagProps {
  name: string;
  color: Color;
}

export function OptionTag({ name, color }: OptionTagProps) {
  return (
    <Badge
      variant="tag"
      size="sm"
      className="h-5 max-w-full min-w-0 shrink-0 text-sm leading-5"
      style={{ backgroundColor: COLOR[color].rgba }}
    >
      <span className="truncate">{name}</span>
    </Badge>
  );
}
