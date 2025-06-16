"use client";

import { redirect } from "next/navigation";

import { Button, toast } from "@notion-kit/shadcn";

import { authClient, useSession } from "@/lib/auth-client";

export function LoginFormClient() {
  const { data } = useSession();

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
              password: "aaaaaaaa",
              callbackURL: "/protected",
            },
            {
              onSuccess: () => {
                toast("Sign up success");
              },
              onError: ({ error }) => {
                toast.error("Sign up error", { description: error.message });
                console.log("Sign up error", error);
              },
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
              password: "aaaaaaaa",
              callbackURL: "/protected",
            },
            {
              onSuccess: () => {
                toast("Sign in success");
              },
              onError: ({ error }) => {
                toast.error("Sign in error", { description: error.message });
                console.log("Sign in error", error);
              },
            },
          );
        }}
      >
        Sign in with Email
      </Button>
    </div>
  );
}
