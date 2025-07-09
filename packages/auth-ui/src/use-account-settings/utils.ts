import type { AuthClient, Passkey, Session } from "@notion-kit/auth";
import type {
  Connection,
  ConnectionStrategy,
  SessionRow,
} from "@notion-kit/settings-panel";

import { handleError } from "../lib";

export function transferPasskeys(passkeys?: Passkey[] | null) {
  if (!passkeys) return [];
  return passkeys.map((passkey, i) => ({
    id: passkey.id,
    name: passkey.name ?? `Unnamed Passkey ${i + 1}`,
    createdAt: passkey.createdAt.valueOf(),
  }));
}

export function transferSessions(sessions: Session["session"][]) {
  return sessions.map((session) => ({
    id: session.id,
    token: session.token,
    lastActive: session.updatedAt.valueOf(),
    device:
      joinStr([session.deviceVendor, session.deviceModel]) || "Unknown Device",
    type: mapDeviceType(session.deviceType),
    location: session.location ?? "",
  }));
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
    handleError(res, "Fetch connections error");
    return [];
  }
  const connections: Connection[] = [];
  res.data.forEach((account) => {
    if (account.provider === "credential") return;
    const type =
      account.provider === "google" ? "google-drive" : account.provider;
    connections.push({
      id: account.id,
      connection: {
        type,
        /**
         * @note Currently, `better-auth` does not return custom fields of `account`.
         */
        account: account.accountId,
        accountId: account.accountId,
      },
      scopes: account.scopes,
    });
  });
  return connections;
}

export async function linkAccount(
  auth: AuthClient,
  strategy: ConnectionStrategy,
) {
  const options = { throw: true };
  switch (strategy) {
    case "github":
      await auth.linkSocial({ provider: "github" }, options);
      return;
    case "google-drive":
      await auth.linkSocial(
        {
          provider: "google",
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
      return;
  }
}

export async function deleteConnection(
  auth: AuthClient,
  { connection }: Connection,
) {
  await auth.unlinkAccount(
    {
      providerId:
        connection.type === "google-drive" ? "google" : connection.type,
      accountId: connection.accountId,
    },
    { throw: true },
  );
}
