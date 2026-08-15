import { MenuGroup, MenuItem } from "@notion-kit/ui/primitives";

interface BulkCheckboxEditorProps {
  onUpdate: (value: boolean) => void;
}

export function BulkCheckboxEditor({ onUpdate }: BulkCheckboxEditorProps) {
  return (
    <MenuGroup>
      <MenuItem label="Checked" onClick={() => onUpdate(true)} />
      <MenuItem label="Unchecked" onClick={() => onUpdate(false)} />
    </MenuGroup>
  );
}
