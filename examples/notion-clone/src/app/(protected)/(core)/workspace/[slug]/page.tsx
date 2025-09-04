"use client";

import { useSettings } from "@/hooks/use-settings";

export default function Page() {
  const { settings } = useSettings();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-6">
      <div>Hi, {settings.account.preferredName}!</div>
      <div>Welcome to {settings.workspace.name}</div>
    </main>
  );
}
