import { Unsplash } from "@notion-kit/ui/unsplash";

const UNSPLASH_ACCESS_KEY = "UNSPLASH_ACCESS_KEY";

export default function Default() {
  return <Unsplash className="w-[540px]" apiKey={UNSPLASH_ACCESS_KEY} />;
}
