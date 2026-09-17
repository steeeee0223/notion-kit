import { Icon, type IconProps } from "@notion-kit/icons";

const actionIcons: Record<string, React.ComponentType<IconProps>> = {
  create: Icon.Plus,
  duplicate: Icon.Duplicate,
  delete: Icon.Trash,
  restore: Icon.Undo,
  hide: Icon.EyeHide,
  show: Icon.Eye,
  move: Icon.ArrowUpDown,
  resize: Icon.ArrowLeftRight,
  update: Icon.Sliders,
  "update-config": Icon.Sliders,
  "change-type": Icon.Sliders,
  "change-layout": Icon.Sliders,
};

export function ActionIcon({ action }: { action: string }) {
  const Component = Object.hasOwn(actionIcons, action)
    ? actionIcons[action]!
    : Icon.Clock;
  return <Component aria-hidden="true" className="size-4 shrink-0 fill-icon" />;
}
