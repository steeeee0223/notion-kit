import { CircleHelp } from "lucide-react";

import { Button } from "@notion-kit/shadcn";

export default function Hint() {
  return (
    <Button variant="hint" size="xs">
      <CircleHelp className="mr-1.5 size-3.5" />
      Learn more about this feature
    </Button>
  );
}
