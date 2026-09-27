import { Icon } from "@notion-kit/icons";
import { ActivityFeed, ActivityItem } from "@notion-kit/ui/activity-feed";

export default function Default() {
  return (
    <ActivityFeed className="w-full max-w-md">
      <ActivityItem
        tone="success"
        icon={<Icon.CheckmarkCircle className="size-3.5 text-green" />}
        title="Invoice captured"
        description="From the paired extension."
        timestamp="2m ago"
      />
      <ActivityItem
        tone="warning"
        title="Amount needs review"
        description="Total doesn't match the purchase order."
        timestamp="18m ago"
      />
      <ActivityItem
        tone="neutral"
        title="Workspace created"
        description="Acme Inc. joined the workspace."
        timestamp="Yesterday"
      />
    </ActivityFeed>
  );
}
