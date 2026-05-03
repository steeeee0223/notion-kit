import { Icon } from "@notion-kit/ui/icons";
import { Button } from "@notion-kit/ui/primitives";

export default function Disabled() {
  return (
    <Button disabled size="md">
      <Icon.ArrowSquarePathUpDown className="mr-2 size-4 animate-spin" /> Please
      wait
    </Button>
  );
}
