"use client";

import { IconBlock } from "@notion-kit/icon-block";

import { useSettings } from "@/hooks/use-settings";

export default function Page() {
  const { settings } = useSettings();

  return (
    <main className="flex h-screen w-full flex-col items-center">
      <div className="mt-10 flex h-20 flex-col items-center justify-center text-2xl">
        <span>Hi, {settings.account.preferredName}!</span>
        <div className="flex items-center gap-2">
          Welcome to
          <IconBlock icon={settings.workspace.icon} size="md" />
          {settings.workspace.name}
        </div>
      </div>
    </main>
  );
}
