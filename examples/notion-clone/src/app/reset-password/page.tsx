import Link from "next/link";

import { ResetPasswordForm } from "@notion-kit/auth-ui";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-main">
      <h1>Reset password</h1>
      <ResetPasswordForm token={token} />
      <Link href="/">Back to sign in</Link>
    </main>
  );
}
