import { StatCard } from "@notion-kit/ui/stat-card";

export default function Interactive() {
  return (
    <StatCard
      className="w-56"
      label="Open invoices"
      value={18}
      caption="Needs review"
      href="#invoices"
    />
  );
}
