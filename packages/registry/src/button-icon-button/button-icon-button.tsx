import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

export default function IconButton() {
  return (
    <Button variant="icon">
      <Icon.TypesText className="size-4" />
    </Button>
  );
}
