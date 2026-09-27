import { StatCard } from "@notion-kit/ui/stat-card";

export default function Loading() {
  return <StatCard className="w-56" label="Monthly revenue" value={128400} loading />;
}
