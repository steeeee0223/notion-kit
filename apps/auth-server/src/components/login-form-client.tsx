"use client";

import { redirect } from "next/navigation";

import { Button, toast } from "@notion-kit/shadcn";

import { authClient, useSession } from "@/lib/auth-client";

export function LoginFormClient() {
  const { data } = useSession();

  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="blue"
          size="md"
          onClick={async () => {
            const res = await authClient.signUp.email({
              email: "mr.steven7@gapp.nthu.edu.tw",
              name: "test user",
              password: "Test_user_12##",
            });
            console.log("[sign-up]", res.data, res.error);
            if (res.data) {
              toast(`Sign up success: ${res.data.user.name}`);
            }
            if (res.error) {
              toast(`Sign up error: ${res.error.message}`);
            }
          }}
        >
          Sign up with Email
        </Button>
        <Button
          variant="blue"
          size="md"
          onClick={async () => {
            const res = await authClient.signIn.email({
              email: "mr.steven7@gapp.nthu.edu.tw",
              password: "Test_user_12##",
            });
            console.log("[sign-in]", res.data, res.error);
            if (res.data) {
              toast(`Sign in success: ${res.data.user.name}`);
            }
            if (res.error) {
              toast(`Sign in error: ${res.error.message}`);
            }
          }}
        >
          Sign in with Email
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        <span>Logged in as {data.user.name}</span>
      </p>

      <Button
        variant="blue"
        size="md"
        onClick={async () => {
          const res = await authClient.signOut();
          console.log("[sign-out]", res.data, res.error);
          if (res.error) {
            toast(`Sign out error: ${res.error.message}`);
          }
          if (res.data?.success) {
            toast(`Sign out success`);
            redirect("/");
          }
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
