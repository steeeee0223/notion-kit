import { Icon } from "@notion-kit/icons";
import { EmptyState } from "@notion-kit/ui/empty-state";
import { Button } from "@notion-kit/ui/primitives";

export default function Default() {
  return (
    <EmptyState
      icon={<Icon.Newspaper className="size-full" />}
      title="No invoices yet"
      description="Invoices you capture with the extension will show up here."
      actions={
        <Button variant="blue" size="sm">
          Install the extension
        </Button>
      }
    />
  );
}
