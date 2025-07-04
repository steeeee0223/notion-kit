import type { AuthClient, ErrorContext } from "@notion-kit/auth";
import type {
  Connection,
  ConnectionStrategy,
} from "@notion-kit/settings-panel";
import { toast } from "@notion-kit/shadcn";

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
  console.log("Connections loaded:", connections);
  return connections;
}

export async function linkAccount(
  auth: AuthClient,
  strategy: ConnectionStrategy,
  callbackURL?: string,
) {
  const options = {
    onSuccess: () => void toast.success(`Connected ${strategy} successfully`),
    onError: (e: ErrorContext) => handleError(e, `Connect ${strategy} error`),
  };
  switch (strategy) {
    case "github":
      await auth.linkSocial({ provider: "github" }, options);
      return;
    case "google-drive":
      await auth.linkSocial(
        {
          callbackURL,
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
    {
      onSuccess: () => void toast.success("Connection unlink successfully"),
      onError: (e: ErrorContext) => handleError(e, "Unlink connection error"),
    },
  );
}

export function handleError(
  { error }: ErrorContext | { error: { message?: string } },
  title: string,
) {
  console.error(title, error);
  toast.error(title, {
    description: error.message,
  });
}
