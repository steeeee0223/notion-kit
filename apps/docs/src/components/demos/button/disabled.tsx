import { RefreshCw } from "lucide-react";

import { Button } from "@notion-kit/shadcn";

export default function Disabled() {
  return (
    <Button disabled size="md">
      <RefreshCw className="mr-2 size-4 animate-spin" /> Please wait
    </Button>
  );
}
