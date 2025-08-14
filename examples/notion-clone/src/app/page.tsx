"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  LoginForm,
  useListWorkspaces,
  useSession,
  type LoginMode,
} from "@notion-kit/auth-ui";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("sign_in");
  const { data, isPending: isLoadingSession } = useSession();
  const { data: workspaces, isPending: isLoadingWorkspaces } =
    useListWorkspaces();
  const isLoading = isLoadingSession || isLoadingWorkspaces;

  useEffect(() => {
    if (!workspaces || isLoading) return;
    if (!data?.user) {
      router.replace("/");
      return;
    }
    if (workspaces.length === 0) {
      router.replace("/onboarding");
      return;
    }
    router.replace(`/workspace/${workspaces[0]!.slug}`);
  }, [data, isLoading, router, workspaces]);

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-main">
      <div className="text-lg text-primary">Home</div>
      <LoginForm
        mode={mode}
        callbackURL="/"
        className="w-80"
        onModeChange={setMode}
      />
    </main>
  );
}
