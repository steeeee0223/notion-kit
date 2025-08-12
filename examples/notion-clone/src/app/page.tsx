"use client";

import { useEffect, useMemo, useState } from "react";

import {
  LoginForm,
  useAuth,
  useListWorkspaces,
  useSession,
  type LoginMode,
} from "@notion-kit/auth-ui";

export default function Page() {
  const [mode, setMode] = useState<LoginMode>("sign_in");
  const { data } = useSession();
  // const {} = useActiveWorkspace()
  const { auth } = useAuth();
  const { data: workspaces } = useListWorkspaces();

  const callbackURL = useMemo(() => {
    if (!data?.user) return "/";
    if (!workspaces || workspaces.length === 0) return "/onboarding";
    return `/workspace/${workspaces[0]!.slug}`;
  }, [data?.user, workspaces]);

  useEffect(() => {
    if (!workspaces || workspaces.length === 0) return;
    void auth.organization.setActive({
      organizationId: workspaces[0]!.id,
    });
  }, [auth.organization, workspaces]);

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-main">
      <div className="text-lg text-primary">Home</div>
      <LoginForm
        mode={mode}
        callbackURL={callbackURL}
        className="w-80"
        onModeChange={setMode}
      />
    </main>
  );
}
