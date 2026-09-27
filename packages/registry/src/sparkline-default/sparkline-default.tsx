import { Sparkline } from "@notion-kit/ui/sparkline";

const data = [4, 6, 5, 8, 7, 10, 9, 13, 11, 15];

export default function Default() {
  return (
    <div className="flex w-64 flex-col gap-4">
      <Sparkline data={data} ariaLabel="Line trend, up over 10 points" className="text-blue" />
      <Sparkline
        data={data}
        ariaLabel="Area trend with the last point highlighted"
        area
        highlightLast
        className="text-green"
      />
    </div>
  );
}
