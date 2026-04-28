import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

export default function Disabled() {
  return (
    <Button disabled size="md">
      <Icon.ArrowSquarePathUpDown className="mr-2 size-4 animate-spin" /> Please
      wait
    </Button>
  );
}
