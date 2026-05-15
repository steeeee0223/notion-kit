import { create } from "zustand";

export interface LayerPlugin {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  MapLayer: React.ComponentType;
  PanelContent?: React.ComponentType;
}

interface LayerState {
  plugins: Map<string, LayerPlugin>;
  register: (
    plugin: Omit<LayerPlugin, "enabled"> & { defaultEnabled?: boolean },
  ) => void;
  toggle: (id: string) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  plugins: new Map(),
  register: (plugin) =>
    set((state) => {
      const newPlugins = new Map(state.plugins);
      if (!newPlugins.has(plugin.id)) {
        newPlugins.set(plugin.id, {
          ...plugin,
          enabled: plugin.defaultEnabled ?? true,
        });
      }
      return { plugins: newPlugins };
    }),
  toggle: (id) =>
    set((state) => {
      const newPlugins = new Map(state.plugins);
      const plugin = newPlugins.get(id);
      if (plugin) {
        newPlugins.set(id, { ...plugin, enabled: !plugin.enabled });
      }
      return { plugins: newPlugins };
    }),
}));
