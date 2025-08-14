"use client";

import { useRouter } from "next/navigation";

import { CreateWorkspaceForm } from "@notion-kit/auth-ui";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main className="flex h-screen items-center justify-center">
      <CreateWorkspaceForm
        onSuccess={(workspace) => {
          router.replace(`/workspace/${workspace.slug}`);
        }}
      />
    </main>
  );
}
