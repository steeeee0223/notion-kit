import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

export default function NavIcon() {
  return (
    <Button variant="nav-icon">
      <Icon.CommentFilled className="size-4 text-default/45" />
    </Button>
  );
}
