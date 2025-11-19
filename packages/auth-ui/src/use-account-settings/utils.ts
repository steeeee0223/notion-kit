import type {
  AuthClient,
  OAuth2UserInfo,
  Passkey,
  Session,
} from "@notion-kit/auth";
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
  const infos = await Promise.all(
    res.data.map(({ accountId }) => auth.accountInfo({ accountId })),
  );
  return res.data.reduce<Connection[]>((acc, account, i) => {
    if (account.providerId === "credential") return acc;
    const type =
      account.providerId === "google" ? "google-drive" : account.providerId;
    const info = infos[i]!;
    if (info.error) {
      console.error(`Fetch ${type} info failed`, info.error);
      return acc;
    }
    // TODO Remove this type assertion. This is added due to issues in `better-auth`
    const user = info.data.user as OAuth2UserInfo;
    acc.push({
      id: account.id,
      connection: {
        type,
        /**
         * @note Currently, `better-auth` does not return custom fields of `account`.
         */
        account: user.name ?? user.email ?? "Account",
        accountId: account.accountId,
      },
      scopes: account.scopes,
    });
    return acc;
  }, []);
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
