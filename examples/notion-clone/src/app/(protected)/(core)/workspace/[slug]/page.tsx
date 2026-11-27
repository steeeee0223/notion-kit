"use client";

import {
  parseWorkspaceIcon,
  useActiveWorkspace,
  useSession,
} from "@notion-kit/auth-ui";
import { IconBlock } from "@notion-kit/ui/icon-block";

import { DatabaseView } from "@/components/database-view";

export default function Page() {
  const { data: session } = useSession();
  const { data: activeWorkspace } = useActiveWorkspace();

  return (
    <main className="flex h-screen w-full flex-col items-center">
      <div className="mt-10 flex h-20 flex-col items-center justify-center text-2xl">
        <span>Hi, {session?.user.preferredName ?? "there"}!</span>
        <div className="flex items-center gap-2">
          Welcome to
          {activeWorkspace && (
            <>
              <IconBlock
                icon={parseWorkspaceIcon(
                  activeWorkspace.logo,
                  activeWorkspace.name,
                )}
                size="md"
              />
              {activeWorkspace.name}
            </>
          )}
        </div>
      </div>
      <DatabaseView />
    </main>
  );
}
