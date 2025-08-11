"use client";

import { useState } from "react";

import { LoginForm, useSession, type LoginMode } from "@notion-kit/auth-ui";

export default function Page() {
  const [mode, setMode] = useState<LoginMode>("sign_in");
  const { data } = useSession();

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-main">
      <div className="text-lg text-primary">Home</div>
      <LoginForm
        mode={mode}
        callbackURL={data ? `/user/${data.user.id}` : "/"}
        className="w-80"
        onModeChange={setMode}
      />
    </main>
  );
}
