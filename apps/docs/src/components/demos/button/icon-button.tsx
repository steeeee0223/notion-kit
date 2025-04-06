import { BoldIcon } from "lucide-react";

import { Button } from "@notion-kit/shadcn";

export default function IconButton() {
  return (
    <Button variant="icon">
      <BoldIcon className="size-4" />
    </Button>
  );
}
