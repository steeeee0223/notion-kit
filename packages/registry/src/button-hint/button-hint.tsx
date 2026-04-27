import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

export default function Hint() {
  return (
    <Button variant="hint" size="xs">
      <Icon.QuestionMarkCircled className="mr-1.5 size-3.5" />
      Learn more about this feature
    </Button>
  );
}
