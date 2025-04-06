import { MessageSquareIcon } from "lucide-react";

import { Button } from "@notion-kit/shadcn";

export default function NavIcon() {
  return (
    <Button variant="nav-icon">
      <MessageSquareIcon className="size-4 text-primary/45" />
    </Button>
  );
}
