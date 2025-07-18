"use server";

import { betterFetch } from "@better-fetch/fetch";
import type { Account, Session } from "better-auth";
import type {
  GithubProfile,
  GoogleProfile,
} from "better-auth/social-providers";
import { eq } from "drizzle-orm";
import { decodeJwt } from "jose";
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
    const res = await getGeoLocation(session.ipAddress);
    if (res) {
      payload.location = joinStr([
        res.city,
        res.regionName,
        res.country || res.countryCode,
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

interface GeoLocation {
  status: "success" | "fail";
  message?: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  timezone: string;
  query: string;
}

/**
 * @note
 * This function is used to get the geo location of the user based on their IP address.
 * It uses the FREE ip-api.com service.
 * @see https://ip-api.com/docs/api:json
 */
async function getGeoLocation(ipAddress: string) {
  const { data, error } = await betterFetch<GeoLocation>(
    `http://ip-api.com/json/${ipAddress}?fields=57631`,
  );
  if (error) {
    console.error(`Failed to fetch geolocation for ${ipAddress}`, error);
    return;
  }
  if (data.status !== "success") {
    console.error(`Failed to fetch geolocation for ${ipAddress}`, data.message);
    return;
  }
  return data;
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
export async function getAccountName(account: Account) {
  if (!account.accessToken) return;

  switch (account.providerId) {
    /**
     * @see https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/social-providers/google.ts#L147
     */
    case "google": {
      if (!account.idToken) return;
      const profile = decodeJwt<GoogleProfile>(account.idToken);
      return profile.name || profile.email;
    }
    /**
     * @see https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/social-providers/github.ts#L104
     */
    case "github": {
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
