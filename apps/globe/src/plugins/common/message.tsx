import { AlertCircle } from "lucide-react";

export function FeedStatusMessage({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const needsSync = status === "missing" || status === "stale";
  const message = needsSync
    ? `${label} is ${status}; sync routes before loading the list.`
    : `${label} is ${status}.`;
  return <PanelMessage message={message} muted={!needsSync} />;
}

export function PanelMessage({
  message,
  muted,
}: {
  message: string;
  muted?: boolean;
}) {
  return (
    <div className="mx-1 mb-1 flex gap-1.5 rounded-md border border-default/15 bg-default/5 p-2 text-xs text-secondary">
      {!muted && (
        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-yellow-600" />
      )}
      <span>{message}</span>
    </div>
  );
}
