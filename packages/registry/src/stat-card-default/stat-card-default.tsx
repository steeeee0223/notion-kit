import { StatCard } from "@notion-kit/ui/stat-card";

export default function Default() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Monthly revenue"
        value={128400}
        format={(value) => `$${(value / 1000).toFixed(1)}k`}
        delta={{ value: "+12.4%", direction: "up" }}
        caption="vs. last month"
      />
      <StatCard
        label="Churn"
        value={3.2}
        format={(value) => `${value}%`}
        delta={{ value: "+0.4pt", direction: "up", positiveIsGood: false }}
        caption="vs. last month"
      />
      <StatCard
        label="Open invoices"
        value={18}
        delta={{ value: "0", direction: "flat" }}
        caption="No change"
      />
    </div>
  );
}
