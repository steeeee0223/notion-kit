"use client";

import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
} from "@notion-kit/settings-panel";

import { useSettings } from "@/hooks/use-settings";

export default function Page() {
  const { tab, setTab, settings, actions } = useSettings();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-6">
      <SettingsProvider settings={settings} {...actions}>
        <SettingsPanel>
          <SettingsSidebar>
            <SettingsSidebarPreset tab={tab} onTabChange={setTab} />
          </SettingsSidebar>
          <SettingsContent>
            <SettingsBodyPreset tab={tab} onTabChange={setTab} />
          </SettingsContent>
        </SettingsPanel>
      </SettingsProvider>
    </main>
  );
}
