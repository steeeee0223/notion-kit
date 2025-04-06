import { ImageIcon } from "lucide-react";

import { CoverPicker } from "@notion-kit/cover";
import { Button } from "@notion-kit/shadcn";

const UNSPLASH_ACCESS_KEY = "UNSPLASH_ACCESS_KEY";

export default function Picker() {
  return (
    <CoverPicker unsplashAPIKey={UNSPLASH_ACCESS_KEY}>
      <Button size="sm">
        <ImageIcon className="mr-2 size-4" />
        Change cover
      </Button>
    </CoverPicker>
  );
}
