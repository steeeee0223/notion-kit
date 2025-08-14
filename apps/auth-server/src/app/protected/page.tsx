"use client";

import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
} from "@notion-kit/settings-panel";
import { Button } from "@notion-kit/shadcn";

import { useSettings } from "@/hooks/use-settings";

export default function Page() {
  const { tab, setTab, settings, actions, signOut } = useSettings();

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-popover">
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
      <Button variant="blue" size="md" onClick={signOut}>
        Sign out
      </Button>
    </main>
  );
}
