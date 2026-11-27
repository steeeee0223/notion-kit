"use client";

import { useSession } from "@notion-kit/auth-ui";
import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
} from "@notion-kit/settings-panel";
import { Dialog, DialogContent } from "@notion-kit/ui/primitives";

import { useSettings } from "@/hooks/use-settings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { tab, setTab, adapters } = useSettings();
  const { data: session } = useSession();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        noTitle
        className="flex h-[calc(100vh-100px)] max-h-180 w-[calc(100vw-100px)] max-w-[1150px] rounded-md border-none p-0 shadow-sm"
      >
        <SettingsProvider
          key={`${session?.user.id ?? "signed-out"}:${session?.session.activeOrganizationId ?? "none"}`}
          adapters={adapters}
        >
          <SettingsPanel>
            <SettingsSidebar>
              <SettingsSidebarPreset tab={tab} onTabChange={setTab} />
            </SettingsSidebar>
            <SettingsContent>
              <SettingsBodyPreset tab={tab} onTabChange={setTab} />
            </SettingsContent>
          </SettingsPanel>
        </SettingsProvider>
      </DialogContent>
    </Dialog>
  );
}
