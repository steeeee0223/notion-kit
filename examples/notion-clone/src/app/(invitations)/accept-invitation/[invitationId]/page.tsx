"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { AcceptInvitationForm } from "@notion-kit/auth-ui";

interface InvitationPageProps {
  params: Promise<{ invitationId: string }>;
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const { invitationId } = use(params);
  const router = useRouter();

  return (
    <main className="flex h-screen items-center justify-center">
      <AcceptInvitationForm
        invitationId={invitationId}
        onAccept={(workspace) => router.replace(`/workspace/${workspace.slug}`)}
      />
    </main>
  );
}
