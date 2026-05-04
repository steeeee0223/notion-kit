import { Icon } from "@notion-kit/icons";
import { CoverPicker } from "@notion-kit/ui/cover";
import { Button } from "@notion-kit/ui/primitives";

const UNSPLASH_ACCESS_KEY = "UNSPLASH_ACCESS_KEY";

export default function Picker() {
  return (
    <CoverPicker unsplashAPIKey={UNSPLASH_ACCESS_KEY}>
      <Button size="sm">
        <Icon.Photo className="mr-2 size-4" />
        Change cover
      </Button>
    </CoverPicker>
  );
}
