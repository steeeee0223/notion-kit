import { Icon } from "@notion-kit/icons";
import { Switch } from "@notion-kit/ui/primitives";

import { useLayerStore } from "@/lib/layer-registry";

export function LayerSidebar() {
  const { plugins, toggle } = useLayerStore();
  const pluginList = Array.from(plugins.values());

  if (pluginList.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-modal shadow-sm">
      <div className="flex items-center gap-2 border-b p-4">
        <Icon.Gear className="size-5 fill-icon" />
        <h2 className="font-semibold">Map Layers</h2>
      </div>

      <div className="flex flex-col gap-2 p-4 pt-0">
        {pluginList.map((plugin) => (
          <div
            key={plugin.id}
            className="flex flex-col gap-3 rounded-lg border p-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>{plugin.icon}</div>
                <span className="text-sm font-medium">{plugin.name}</span>
              </div>
              <Switch
                checked={plugin.enabled}
                onCheckedChange={() => toggle(plugin.id)}
              />
            </div>

            {plugin.enabled && plugin.PanelContent && (
              <div className="mt-2 border-t pt-3">
                <plugin.PanelContent />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
