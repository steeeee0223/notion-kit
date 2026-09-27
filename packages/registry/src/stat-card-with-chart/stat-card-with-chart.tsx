import { Sparkline } from "@notion-kit/ui/sparkline";
import { StatCard } from "@notion-kit/ui/stat-card";

const data = [12, 18, 14, 22, 19, 27, 24, 31, 28, 35];

export default function WithChart() {
  return (
    <StatCard
      className="w-72"
      label="Weekly active workspaces"
      value={35}
      delta={{ value: "+9.4%", direction: "up" }}
      period="Last 10 weeks"
      chart={
        <Sparkline
          data={data}
          ariaLabel="Weekly active workspaces, trending up 9.4%"
          area
          highlightLast
          className="text-green"
        />
      }
    />
  );
}
