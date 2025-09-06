/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
"use client";

import { useTranslation } from "react-i18next";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { toast, TooltipPreset } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../core";

export function SetupSection() {
  const {
    settings: { workspace },
  } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.setup", { returnObjects: true });
  /** Handlers */
  const [, copy] = useCopyToClipboard();
  const handleCopy = async () => {
    await copy(workspace.id);
    toast.success("Copied property to clipboard");
  };

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule title="" description={trans["workspace-id"].description}>
        <TooltipPreset
          description={trans["workspace-id"].tooltip}
          side="top"
          sideOffset={15}
          align="center"
        >
          <div className="min-w-max px-[60px] text-xs/4 text-secondary">
            <a
              onClick={handleCopy}
              rel="noopener noreferrer"
              className="inline cursor-pointer underline select-none hover:text-red-600"
            >
              {workspace.id}
            </a>
          </div>
        </TooltipPreset>
      </SettingsRule>
    </SettingsSection>
  );
}
