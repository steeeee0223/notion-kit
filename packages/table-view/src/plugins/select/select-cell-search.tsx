import type { ReactNode } from "react";

import { ComboboxChips, ComboboxChipsInput } from "@notion-kit/ui/primitives";

export function SelectCellSearch({
  children,
  action,
  label,
  placeholder,
  onClose,
}: {
  children?: ReactNode;
  action?: ReactNode;
  label: string;
  placeholder: string;
  onClose?: () => void;
}) {
  return (
    <ComboboxChips variant="inline" hideClearButton className="z-10 max-h-60">
      {children}
      <ComboboxChipsInput
        aria-label={label}
        placeholder={placeholder}
        className={action ? "w-0" : undefined}
        onKeyDownCapture={(event) => {
          // The inline combobox stays open. Escape dismisses the cell editor.
          if (event.key !== "Escape" || !onClose) return;
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }}
      />
      {action}
    </ComboboxChips>
  );
}
