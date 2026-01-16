"use client";

import {
  SettingsBodyPreset,
  SettingsContent,
  SettingsPanel,
  SettingsProvider,
  SettingsSidebar,
  SettingsSidebarPreset,
} from "@notion-kit/settings-panel";
import { Dialog, DialogContent } from "@notion-kit/shadcn";

import { useSettings } from "@/hooks/use-settings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { tab, setTab, settings, actions } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        noTitle
        className="flex h-[calc(100vh-100px)] max-h-[720px] w-[calc(100vw-100px)] max-w-[1150px] rounded border-none p-0 shadow"
        onClick={(e) => e.stopPropagation()}
        /**
         * tmporary fix
         * @see https://github.com/radix-ui/primitives/issues/1241
         */
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.body.style.pointerEvents = "";
        }}
      >
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
      </DialogContent>
    </Dialog>
  );
}
