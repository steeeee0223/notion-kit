import { Kbd, KbdGroup } from "@notion-kit/ui/kbd";

export default function Default() {
  return (
    <div className="flex items-center gap-4">
      <Kbd>Esc</Kbd>
      <KbdGroup aria-label="Command K">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  );
}
