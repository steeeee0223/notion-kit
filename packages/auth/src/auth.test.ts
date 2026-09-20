import { afterEach, describe, expect, it, vi } from "vitest";

import { createAuth } from "./auth";

const env = {
  POSTGRES_URL: "postgresql://test:test@localhost:5432/test",
  BETTER_AUTH_URL: "https://auth.example.com",
  BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
  BETTER_AUTH_API_KEY: "test-email-key",
  BETTER_AUTH_API_URL: "https://email.example.com",
  TRUSTED_ORIGINS: ["https://app.example.com"],
  APP_URL: "https://app.example.com",
  GOOGLE_CLIENT_ID: "test",
  GOOGLE_CLIENT_SECRET: "test",
  GITHUB_CLIENT_ID: "test",
  GITHUB_CLIENT_SECRET: "test",
  NODE_ENV: "test" as const,
};
const user = {
  id: "u1",
  email: "old@example.com",
  name: "User",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterEach(() => vi.unstubAllGlobals());

describe("shared auth configuration", () => {
  it("sends change-email confirmation to the original mailbox using official templates", async () => {
    const sent: unknown[] = [];
    vi.stubGlobal("fetch", (_url: unknown, init: { body: string }) => {
      sent.push(JSON.parse(init.body));
      return Promise.resolve(Response.json({ messageId: "mail-1" }));
    });
    const auth = createAuth(env);
    await auth.options.user.changeEmail.sendChangeEmailConfirmation({
      user,
      newEmail: "new@example.com",
      url: "https://auth.example.com/verify?token=secret",
      token: "secret",
    });
    expect(sent).toEqual([
      {
        template: "change-email",
        to: "old@example.com",
        variables: {
          newEmail: "new@example.com",
          currentEmail: "old@example.com",
          confirmationLink: "https://auth.example.com/verify?token=secret",
        },
      },
    ]);
  });
  it("sends verification links and recipient variables through the official sender", async () => {
    const sent: unknown[] = [];
    vi.stubGlobal("fetch", (_url: unknown, init: { body: string }) => {
      sent.push(JSON.parse(init.body));
      return Promise.resolve(Response.json({ messageId: "verify-1" }));
    });
    const auth = createAuth(env);
    await auth.options.emailVerification.sendVerificationEmail({
      user,
      url: "https://auth.example.com/api/auth/verify-email?token=verify-token&callbackURL=https%3A%2F%2Fapp.example.com",
      token: "verify-token",
    });
    expect(sent).toEqual([
      {
        template: "verify-email",
        to: "old@example.com",
        variables: {
          verificationUrl:
            "https://auth.example.com/api/auth/verify-email?token=verify-token&callbackURL=https%3A%2F%2Fapp.example.com",
          userEmail: "old@example.com",
          userName: "User",
        },
      },
    ]);
  });
  it("sends password reset links without replacing the caller callback", async () => {
    const sent: unknown[] = [];
    vi.stubGlobal("fetch", (_url: unknown, init: { body: string }) => {
      sent.push(JSON.parse(init.body));
      return Promise.resolve(Response.json({ messageId: "reset-1" }));
    });
    const auth = createAuth(env);
    await auth.options.emailAndPassword.sendResetPassword({
      user,
      url: "https://auth.example.com/api/auth/reset-password/reset-token?callbackURL=https%3A%2F%2Fsecond.example.com%2Freset",
      token: "reset-token",
    });
    expect(sent).toEqual([
      {
        template: "reset-password",
        to: "old@example.com",
        variables: {
          resetLink:
            "https://auth.example.com/api/auth/reset-password/reset-token?callbackURL=https%3A%2F%2Fsecond.example.com%2Freset",
          userEmail: "old@example.com",
        },
      },
    ]);
  });
  it.each([
    [
      "https://app.example.com",
      "https://app.example.com/accept-invitation/invite%2F1",
    ],
    [
      "https://second.example.com",
      "https://second.example.com/accept-invitation/invite%2F1",
    ],
    [
      "https://untrusted.example.com",
      "https://app.example.com/accept-invitation/invite%2F1",
    ],
    [undefined, "https://app.example.com/accept-invitation/invite%2F1"],
  ])(
    "routes invitation mail from %s only to a configured app",
    async (origin, inviteLink) => {
      const sent: unknown[] = [];
      vi.stubGlobal("fetch", (_url: unknown, init: { body: string }) => {
        sent.push(JSON.parse(init.body));
        return Promise.resolve(Response.json({ messageId: "invite-1" }));
      });
      const auth = createAuth({
        ...env,
        TRUSTED_ORIGINS: [
          "https://app.example.com",
          "https://second.example.com",
        ],
      });
      const plugin = (await auth.$context).getPlugin("organization");
      if (!plugin) throw new Error("Organization plugin missing");
      const invitation = {
        id: "invite/1",
        organizationId: "org-1",
        email: "invitee@example.com",
        role: "member",
        status: "pending" as const,
        inviterId: "member-1",
        expiresAt: new Date("2030-01-01"),
        createdAt: new Date("2029-12-30"),
      };
      await plugin.options.sendInvitationEmail?.(
        {
          ...invitation,
          invitation,
          organization: {
            id: "org-1",
            name: "Workspace",
            slug: "workspace",
            createdAt: new Date("2029-12-30"),
          },
          inviter: {
            id: "member-1",
            organizationId: "org-1",
            userId: user.id,
            role: "owner",
            createdAt: new Date("2029-12-30"),
            user,
          },
        },
        origin
          ? new Request(
              "https://auth.example.com/api/auth/organization/invite-member",
              { headers: { origin } },
            )
          : undefined,
      );
      expect(sent).toEqual([
        {
          template: "invitation",
          to: "invitee@example.com",
          variables: {
            inviteLink,
            inviterName: "User",
            inviterEmail: "old@example.com",
            organizationName: "Workspace",
            role: "member",
          },
        },
      ]);
    },
  );
  it("isolates sender credentials, origins, and base paths between factory instances", async () => {
    const requests: { url: string; authorization: string | null }[] = [];
    vi.stubGlobal("fetch", (url: string | URL, init: RequestInit) => {
      requests.push({
        url: url.toString(),
        authorization: new Headers(init.headers).get("authorization"),
      });
      return Promise.resolve(Response.json({ messageId: "isolated-1" }));
    });
    const first = createAuth(env);
    const second = createAuth(
      {
        ...env,
        BETTER_AUTH_URL: "https://second-auth.example.com",
        APP_URL: "https://second.example.com",
        TRUSTED_ORIGINS: [],
        BETTER_AUTH_API_URL: "https://second-email.example.com",
        BETTER_AUTH_API_KEY: "second-test-email-key",
      },
      { basePath: "/identity" },
    );
    const firstResponse = await first.handler(
      new Request("https://auth.example.com/api/auth/ok"),
    );
    const secondResponse = await second.handler(
      new Request("https://second-auth.example.com/identity/ok"),
    );
    expect(await firstResponse.json()).toEqual({ ok: true });
    expect(await secondResponse.json()).toEqual({ ok: true });
    expect(second.options.trustedOrigins).toEqual([
      "https://second-auth.example.com",
      "https://second.example.com",
    ]);
    expect(first.options.trustedOrigins).toEqual([
      "https://auth.example.com",
      "https://app.example.com",
    ]);
    const message = {
      user,
      url: "https://auth.example.com/verify",
      token: "verify",
    };
    await second.options.emailVerification.sendVerificationEmail(message);
    await first.options.emailVerification.sendVerificationEmail(message);
    expect(requests).toEqual([
      {
        url: "https://second-email.example.com/api/v1/email/send",
        authorization: "Bearer second-test-email-key",
      },
      {
        url: "https://email.example.com/api/v1/email/send",
        authorization: "Bearer test-email-key",
      },
    ]);
  });
  it("does not treat a rejected email request as delivery success", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve(Response.json({ message: "rejected" }, { status: 403 })),
    );
    const auth = createAuth(env);
    await expect(
      auth.options.emailVerification.sendVerificationEmail({
        user,
        url: "https://auth.example.com/verify",
        token: "secret",
      }),
    ).rejects.toThrow("Email delivery failed");
  });
});
