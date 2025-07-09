export const QUERY_KEYS = {
  sessions: (accountId: string) => ["account", accountId, "sessions"],
  passkeys: (accountId: string) => ["account", accountId, "passkeys"],
  connections: (accountId: string) => ["account", accountId, "connections"],
};

export function createDefaultFn(data: void): () => Promise<void>;
export function createDefaultFn<T>(data: T): () => Promise<T>;
export function createDefaultFn<T>(data: T | void) {
  return () => Promise.resolve(data);
}
