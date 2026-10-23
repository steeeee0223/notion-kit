import { Unsplash } from "@notion-kit/ui/unsplash";

const UNSPLASH_ACCESS_KEY = "UNSPLASH_ACCESS_KEY";

export default function Default() {
  return (
    <div className="flex w-full max-w-135 flex-col">
      <Unsplash apiKey={UNSPLASH_ACCESS_KEY} />
    </div>
  );
}
