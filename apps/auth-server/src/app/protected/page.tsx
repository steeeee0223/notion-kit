"use client";

import { useRouter } from "next/navigation";

import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
} from "@notion-kit/settings-panel";
import { Button, toast } from "@notion-kit/shadcn";

import { useSettings } from "@/hooks/use-settings";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const router = useRouter();
  const { tab, setTab, settings, updateSettings } = useSettings();

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-main">
      <SettingsProvider settings={settings} updateSettings={updateSettings}>
        <SettingsPanel>
          <SettingsSidebar>
            <SettingsSidebarPreset tab={tab} onTabChange={setTab} />
          </SettingsSidebar>
          <SettingsContent>
            <SettingsBodyPreset tab={tab} onTabChange={setTab} />
          </SettingsContent>
        </SettingsPanel>
      </SettingsProvider>
      <Button
        variant="blue"
        size="md"
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => router.push("/"),
              onError: ({ error }) =>
                void toast.error(`Sign out error: ${error.message}`),
            },
          });
        }}
      >
        Sign out
      </Button>
    </main>
  );
}
