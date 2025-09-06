"use client";

import { useModal } from "@notion-kit/modal";
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

export function SettingsModal() {
  const { isOpen, closeModal } = useModal();
  const { tab, setTab, settings, actions } = useSettings();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
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
