"use server";

import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth";
import { eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

import { db } from "./db";
import * as schema from "./schemas";

interface UpdateSessionPayload {
  location: string;
  deviceType: string;
  deviceVendor: string;
  deviceModel: string;
  activeOrganizationId?: string;
}

export async function updateSessionData(
  session: Session & Record<string, unknown>,
) {
  const payload: UpdateSessionPayload = {
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
  // find organization
  if (!("activeOrganizationId" in session) || !session.activeOrganizationId) {
    const organizations = await db
      .select({ organizationId: schema.member.organizationId })
      .from(schema.member)
      .where(eq(schema.member.userId, session.userId));
    payload.activeOrganizationId = organizations.at(0)?.organizationId;
  }
  await db
    .update(schema.session)
    .set({ ...payload })
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
