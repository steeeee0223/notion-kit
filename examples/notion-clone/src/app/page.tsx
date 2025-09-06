"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  LoginForm,
  useActiveWorkspace,
  useSession,
  type LoginMode,
} from "@notion-kit/auth-ui";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("sign_in");
  const { data, isPending: isLoadingSession } = useSession();
  const { data: activeWorkspace, isPending: isLoadingActiveWorkspace } =
    useActiveWorkspace();
  const isLoading = isLoadingSession || isLoadingActiveWorkspace;

  useEffect(() => {
    if (isLoading) return;
    if (!data?.user) {
      router.replace("/");
      return;
    }
    if (!data.session.activeOrganizationId || !activeWorkspace) {
      router.replace("/onboarding");
      return;
    }
    router.replace(`/workspace/${activeWorkspace.slug}`);
  }, [data, isLoading, router, activeWorkspace]);

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
