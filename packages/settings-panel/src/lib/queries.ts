export const QUERY_KEYS = {
  sessions: (accountId: string) => ["account", accountId, "sessions"],
  passkeys: (accountId: string) => ["account", accountId, "passkeys"],
  connections: (accountId: string) => ["account", accountId, "connections"],
  members: (workspaceId: string) => ["workspace", workspaceId, "members"],
  invitations: (workspaceId: string) => [
    "workspace",
    workspaceId,
    "members",
    "invitations",
  ],
  teamspaces: (workspaceId: string) => ["workspace", workspaceId, "teamspaces"],
};

export function createDefaultFn(data: void): () => Promise<void>;
export function createDefaultFn<T>(data: T): () => Promise<T>;
export function createDefaultFn<T>(data: T | void) {
  return () => Promise.resolve(data);
}

export const LOCALSTORAGE_KEYS = {
  locale: "notion-kit:preferences:locale",
  timezone: "notion-kit:preferences:timezone",
};
