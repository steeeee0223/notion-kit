"use server";

import { betterFetch } from "@better-fetch/fetch";
import type { Account, Session } from "better-auth";
import type { GithubProfile } from "better-auth/social-providers";
import { eq } from "drizzle-orm";
import { lookup } from "ip-location-api";
import { UAParser } from "ua-parser-js";

import { db } from "./db";
import * as schema from "./schemas";

export async function updateSessionData(session: Session) {
  const payload = {
    location: "",
    deviceType: "",
    deviceVendor: "",
    deviceModel: "",
  };
  if (session.ipAddress) {
    const res = await Promise.resolve(lookup(session.ipAddress));
    if (res) {
      payload.location = joinStr([
        res.city,
        res.region1_name,
        res.country_name || res.country,
      ]);
    }
  }
  if (session.userAgent) {
    const { device } = UAParser(session.userAgent);
    payload.deviceVendor = device.vendor ?? "";
    payload.deviceModel = device.model ?? "";
    payload.deviceType = device.type ?? "unknown";
  }
  await db
    .update(schema.session)
    .set(payload)
    .where(eq(schema.session.id, session.id));
}

function joinStr(data: (string | undefined)[]) {
  return data.filter(Boolean).join(", ");
}

export async function updateAccountName(account: Account) {
  if (!account.accessToken) return;
  const username = await getAccountName(account);
  if (!username) return;
  await db
    .update(schema.account)
    .set({ username })
    .where(eq(schema.account.id, account.id));
}

/**
 * @note
 * This function is used to get the account name for display purposes.
 */
export async function getAccountName(account: {
  providerId: string;
  accessToken?: string | null;
}) {
  if (!account.accessToken) return;

  switch (account.providerId) {
    case "github": {
      /**
       * @see https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/social-providers/github.ts#L104
       */
      const { data: profile, error } = await betterFetch<GithubProfile>(
        "https://api.github.com/user",
        {
          headers: {
            "User-Agent": "better-auth",
            authorization: `Bearer ${account.accessToken}`,
          },
        },
      );
      if (error) {
        console.error("Failed to fetch GitHub profile:", error);
        return;
      }
      return profile.name || profile.email;
    }
    default:
      return;
  }
}
