import { Icon } from "@notion-kit/ui/icons";
import { Button } from "@notion-kit/ui/primitives";

export default function NavIcon() {
  return (
    <Button variant="nav-icon">
      <Icon.CommentFilled className="size-4 text-default/45" />
    </Button>
  );
}
