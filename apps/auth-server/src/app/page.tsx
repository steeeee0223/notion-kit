import { LoginFormClient } from "@/components/login-form-client";

export default function Page() {
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-main">
      <div className="text-lg text-primary">Home</div>
      <LoginFormClient />
    </main>
  );
}
