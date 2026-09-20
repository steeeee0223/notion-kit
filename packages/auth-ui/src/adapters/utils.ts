import { UAParser } from "ua-parser-js";
import { z } from "zod/v4";

import type { AuthClient, Passkey, Session } from "@notion-kit/auth/client";
import { Role } from "@notion-kit/schemas";
import type {
  Connection,
  ConnectionStrategy,
  SessionRow,
} from "@notion-kit/settings-panel";

export function transferPasskeys(passkeys?: Passkey[] | null) {
  if (!passkeys) return [];
  return passkeys.map((passkey, i) => ({
    id: passkey.id,
    name: passkey.name ?? `Unnamed Passkey ${i + 1}`,
    createdAt: passkey.createdAt.valueOf(),
  }));
}

export function transferSessions(sessions: Session["session"][]) {
  return sessions.map((session) => {
    const { device, os, browser } = UAParser(session.userAgent ?? "");
    return {
      id: session.id,
      token: session.token,
      lastActive: session.updatedAt.valueOf(),
      device:
        joinStr([device.vendor, device.model]) ||
        joinStr([os.name, browser.name]) ||
        "Unknown Device",
      type: mapDeviceType(device.type),
      location: session.ipAddress ?? "",
    };
  });
}

/**
 * @param type https://docs.uaparser.dev/info/device/type.html
 */
function mapDeviceType(type?: string | null): SessionRow["type"] {
  switch (type) {
    case "mobile":
      return "mobile";
    case "tablet":
      return "laptop";
    default:
      return "unknown";
  }
}

function joinStr(data: (string | null | undefined)[]) {
  return data.filter(Boolean).join(", ");
}

export async function loadConnections(auth: AuthClient) {
  const res = await auth.listAccounts();
  if (res.error) {
    throw new Error(res.error.message);
  }
  return Promise.all(
    res.data
      .filter((account) => account.providerId !== "credential")
      .map(async (account): Promise<Connection> => {
        const info = await auth.accountInfo({
          query: { accountId: account.id },
        });
        if (info.error) throw new Error(info.error.message);
        const user = info.data.user;
        return {
          id: account.id,
          connection: {
            type:
              account.providerId === "google"
                ? "google-drive"
                : account.providerId,
            account: user.name ?? user.email ?? "Account",
            accountId: account.accountId,
          },
          scopes: account.scopes,
        };
      }),
  );
}

export async function linkAccount(
  auth: AuthClient,
  strategy: ConnectionStrategy,
  callbackURL: string,
) {
  const options = { throw: true };
  switch (strategy) {
    case "github":
      await auth.linkSocial({ provider: "github", callbackURL }, options);
      return;
    case "google-drive":
      await auth.linkSocial(
        {
          provider: "google",
          callbackURL,
          scopes: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/drive.readonly",
          ],
        },
        options,
      );
      return;
    default:
      throw new Error("This connection provider is not supported");
  }
}

export async function deleteConnection(auth: AuthClient, { id }: Connection) {
  await auth.unlinkAccount({ accountId: id }, { throw: true });
}

/** Select a display role; authorization remains on the server. */
export function displayRole(value: unknown): Role {
  const roles = z
    .array(z.enum(Role))
    .min(1)
    .parse(
      z
        .string()
        .parse(value)
        .split(",")
        .map((role) => role.trim()),
    );
  return [Role.OWNER, Role.ADMIN, Role.MEMBER, Role.GUEST].find((role) =>
    roles.includes(role),
  )!;
}
