import { eq, sql } from "drizzle-orm";

import { config } from "../db/schema";
import { badRequest, notFound } from "../lib/api-error";

export type CredentialMap = Record<string, string | null>;

const INVALID_CREDENTIAL_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);
const CREDENTIAL_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

export function getConfigAdminToken(token: string | undefined): string {
  return token ?? "admin";
}

export function validateCredentialKey(key: string): void {
  if (INVALID_CREDENTIAL_KEYS.has(key)) {
    throw badRequest("Credential key is not allowed", { key });
  }
  if (!CREDENTIAL_KEY_PATTERN.test(key)) {
    throw badRequest("Credential keys must use lowercase snake_case", { key });
  }
}

export function redactCredentials(
  credentials: CredentialMap,
): Record<string, { present: boolean }> {
  return Object.fromEntries(
    Object.entries(credentials).map(([key, value]) => [
      key,
      { present: typeof value === "string" && value.length > 0 },
    ]),
  );
}

export async function getConfigForAdminToken(adminToken: string) {
  const { db } = await import("../db");
  const [row] = await db
    .select()
    .from(config)
    .where(eq(config.adminToken, adminToken))
    .limit(1);
  if (!row) throw notFound("Config admin token not found");
  return row;
}

export async function getActiveConfig(adminToken: string | undefined) {
  return getConfigForAdminToken(getConfigAdminToken(adminToken));
}

export async function upsertCredentials(
  adminToken: string,
  credentials: CredentialMap,
) {
  for (const key of Object.keys(credentials)) validateCredentialKey(key);

  const { db } = await import("../db");
  const [row] = await db
    .insert(config)
    .values({ adminToken, credentials, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: config.adminToken,
      set: {
        credentials: sql`excluded.credentials`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .returning();

  return row;
}

export async function patchCredential(
  adminToken: string,
  key: string,
  value: string | null,
) {
  validateCredentialKey(key);

  const { db } = await import("../db");
  const [row] = await db
    .insert(config)
    .values({
      adminToken,
      credentials: { [key]: value },
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: config.adminToken,
      set: {
        credentials: sql`${config.credentials} || excluded.credentials`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .returning();

  return row;
}

export async function removeCredential(adminToken: string, key: string) {
  validateCredentialKey(key);

  const { db } = await import("../db");
  const [row] = await db
    .update(config)
    .set({
      credentials: sql`${config.credentials} - ${key}`,
      updatedAt: new Date(),
    })
    .where(eq(config.adminToken, adminToken))
    .returning();

  if (!row) throw notFound("Config admin token not found");

  return row;
}
