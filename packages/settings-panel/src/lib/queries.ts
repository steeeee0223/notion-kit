export const QUERY_KEYS = {
  account: (accountId: string) => ["nk:account", accountId, "user"],
  sessions: (accountId: string) => ["nk:account", accountId, "sessions"],
  passkeys: (accountId: string) => ["nk:account", accountId, "passkeys"],
  connections: (accountId: string) => ["nk:account", accountId, "connections"],
  workspace: (workspaceId: string) => ["nk:workspace", workspaceId, "general"],
  members: (workspaceId: string) => ["nk:workspace", workspaceId, "members"],
  invitations: (workspaceId: string) => [
    "nk:workspace",
    workspaceId,
    "members",
    "invitations",
  ],
  teamspaces: (workspaceId: string) => [
    "nk:workspace",
    workspaceId,
    "teamspaces",
  ],
};

export function createDefaultFn(data: void): () => Promise<void>;
export function createDefaultFn<T>(data: T): () => Promise<T>;
export function createDefaultFn<T>(data: T | void) {
  return () => Promise.resolve(data);
}

export const LOCALSTORAGE_KEYS = {
  locale: "nk:preferences:locale",
  timezone: "nk:preferences:timezone",
};
