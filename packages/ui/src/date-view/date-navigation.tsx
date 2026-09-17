import { Icon } from "@notion-kit/icons";

import { Button } from "@/primitives";

export interface DateNavigationProps {
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
  slot?: string;
  disabled?: boolean;
}

export function DateNavigation({
  onPrevious,
  onToday,
  onNext,
  slot,
  disabled,
}: DateNavigationProps) {
  return (
    <div data-slot={slot} className="flex items-center">
      <Button
        variant="hint"
        size="xs"
        aria-label="Previous"
        disabled={disabled}
        onClick={onPrevious}
      >
        <Icon.Chevron side="left" className="fill-icon" />
      </Button>
      <Button
        variant="hint"
        size="xs"
        className="text-primary"
        disabled={disabled}
        onClick={onToday}
      >
        Today
      </Button>
      <Button
        variant="hint"
        size="xs"
        aria-label="Next"
        disabled={disabled}
        onClick={onNext}
      >
        <Icon.Chevron side="right" className="fill-icon" />
      </Button>
    </div>
  );
}
