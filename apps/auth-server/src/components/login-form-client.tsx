"use client";

import { redirect, useRouter } from "next/navigation";

import { Button, toast } from "@notion-kit/shadcn";

import { authClient, useSession } from "@/lib/auth-client";

export function LoginFormClient() {
  const { data } = useSession();
  const router = useRouter();

  if (data) return redirect("/protected");

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="blue"
        size="md"
        onClick={async () => {
          await authClient.signUp.email(
            {
              email: "mr.steven7@gapp.nthu.edu.tw",
              name: "test user",
              password: "Test_user_12##",
            },
            {
              onSuccess: ({ data }) => {
                toast(`Sign up success: ${data.user.name}`);
                router.push("/protected");
              },
              onError: ({ error }) =>
                void toast(`Sign up error: ${error.message}`),
            },
          );
        }}
      >
        Sign up with Email
      </Button>
      <Button
        variant="blue"
        size="md"
        onClick={async () => {
          await authClient.signIn.email(
            {
              email: "mr.steven7@gapp.nthu.edu.tw",
              password: "Test_user_12##",
            },
            {
              onSuccess: ({ data }) => {
                toast(`Sign up success: ${data.user.name}`);
                router.push("/protected");
              },
              onError: ({ error }) =>
                void toast(`Sign up error: ${error.message}`),
            },
          );
        }}
      >
        Sign in with Email
      </Button>
    </div>
  );
}
