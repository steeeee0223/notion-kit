import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItemSwitch,
  MenuLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@notion-kit/ui/primitives";

import { useAdapterStore } from "@/adapters";
import type { SourceAdapterId } from "@/adapters";
import { useLayerStore } from "@/lib/layer-registry";

import { QuickLocations } from "./quick-locations";

const SOURCES: {
  value: SourceAdapterId;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "bkk",
    label: "BKK Futar (TODO)",
    icon: <Icon.Map className="size-4 fill-icon" />,
  },
  {
    value: "transit",
    label: "Transitland Global",
    icon: <Icon.Globe className="size-4 fill-icon" />,
  },
  {
    value: "simulator",
    label: "Simulator",
    icon: <Icon.Map className="size-4 fill-icon" />,
  },
];

export function LayerSidebar() {
  const { plugins, toggle } = useLayerStore();
  const pluginList = Array.from(plugins.values());
  const { activeAdapter, setActiveAdapter } = useAdapterStore();

  if (pluginList.length === 0) return null;

  return (
    <div className="flex w-72 flex-col gap-0 rounded-lg border bg-modal shadow-sm">
      <div className="flex items-center gap-2 border-b p-4 pb-3">
        <Icon.Gear className="size-5 fill-icon" />
        <h2 className="font-semibold">Map Settings</h2>
      </div>

      <Tabs defaultValue="plugins" className="size-full">
        <TabsList className="w-full">
          <TabsTrigger value="plugins" className="flex-1">
            By Feature
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex-1">
            By Source
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="plugins"
          className="m-0 flex flex-col gap-4 overflow-auto p-4"
          style={{ maxHeight: 600 }}
        >
          <QuickLocations />

          <MenuGroup>
            <MenuLabel className="text-xs font-semibold text-secondary">
              Data Source
            </MenuLabel>
            <Select
              items={SOURCES}
              value={activeAdapter}
              onValueChange={(nextValue) => {
                if (nextValue !== null) setActiveAdapter(nextValue);
              }}
            >
              <SelectTrigger className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SOURCES.map((option) => (
                    <SelectItem key={option.value} {...option} />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </MenuGroup>

          <MenuGroup className="gap-4">
            <MenuLabel className="text-xs font-semibold text-secondary">
              Active Layers
            </MenuLabel>
            {pluginList.map((plugin) => (
              <div
                key={plugin.id}
                className="flex flex-col gap-2 rounded-lg border p-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>{plugin.icon}</div>
                    <span className="text-sm font-medium">{plugin.name}</span>
                  </div>
                  <Switch
                    size="sm"
                    checked={plugin.enabled}
                    onCheckedChange={() => toggle(plugin.id)}
                  />
                </div>

                {plugin.enabled && plugin.PanelContent && (
                  <>
                    <Separator />
                    <plugin.PanelContent />
                  </>
                )}
              </div>
            ))}
          </MenuGroup>
        </TabsContent>

        <TabsContent
          value="sources"
          className="m-0 flex flex-col gap-4 p-4"
          style={{ maxHeight: 600 }}
        >
          <div className="flex flex-col gap-2">
            {Object.entries(SOURCES).map(([id, source]) => (
              <div
                key={id}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-3 shadow-xs transition-colors",
                  activeAdapter === id && "bg-default/10",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>{source.icon}</div>
                    <span className="text-sm font-medium">{source.label}</span>
                  </div>
                  <Switch
                    size="sm"
                    checked={activeAdapter === id}
                    onCheckedChange={() =>
                      setActiveAdapter(id as SourceAdapterId)
                    }
                  />
                </div>

                {activeAdapter === id && (
                  <div className="mt-2 flex flex-col gap-2 border-t pt-3">
                    <MenuGroup>
                      <MenuLabel title="Layers" />
                      {pluginList.map((plugin) => (
                        <MenuItemSwitch
                          key={plugin.id}
                          label={plugin.name}
                          checked={plugin.enabled}
                          onCheckedChange={() => toggle(plugin.id)}
                        />
                      ))}
                    </MenuGroup>
                    {pluginList.find((p) => p.enabled && p.PanelContent) && (
                      <div className="mt-2 flex flex-col gap-3 border-t pt-3">
                        {pluginList.map((plugin) => {
                          if (!plugin.enabled || !plugin.PanelContent)
                            return null;
                          return (
                            <div key={plugin.id}>
                              <plugin.PanelContent />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
