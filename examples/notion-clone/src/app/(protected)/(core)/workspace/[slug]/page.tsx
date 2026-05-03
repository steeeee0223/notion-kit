"use client";

import { useSession } from "@notion-kit/auth-ui";
import { IconBlock } from "@notion-kit/ui/icon-block";
import type { IconData } from "@notion-kit/schemas";

import { DatabaseView } from "@/components/database-view";
import { useWorkspaceList } from "@/hooks/use-workspace-list";

export default function Page() {
  const { data: session } = useSession();
  const { activeWorkspace } = useWorkspaceList();

  return (
    <main className="flex h-screen w-full flex-col items-center">
      <div className="mt-10 flex h-20 flex-col items-center justify-center text-2xl">
        <span>Hi, {session?.user.preferredName ?? "there"}!</span>
        <div className="flex items-center gap-2">
          Welcome to
          <IconBlock icon={activeWorkspace.icon as IconData} size="md" />
          {activeWorkspace.name}
        </div>
      </div>
      <DatabaseView />
    </main>
  );
}
