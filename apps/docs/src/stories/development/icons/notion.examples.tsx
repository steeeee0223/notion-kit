import { Icon } from "@notion-kit/icons";

export function IconGallery() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Object.entries(Icon).map(([name, Component]) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Component side="down" className="size-5 fill-menu-icon" />
          <span className="text-xs">{name}</span>
        </div>
      ))}
    </div>
  );
}
