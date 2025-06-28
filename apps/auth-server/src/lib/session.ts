"use server";

import { cache } from "react";
import { headers } from "next/headers";
import { lookup } from "ip-location-api";
import { UAParser } from "ua-parser-js";

import type { Session } from "@notion-kit/auth";
import type { Passkey, SessionRow } from "@notion-kit/settings-panel";

import { auth } from "./auth";

export const listSessions = cache(async () => {
  const sessions = await auth.api.listSessions({ headers: await headers() });
  return await Promise.all(sessions.map(getSessionData));
});

async function getSessionData(
  session: Session["session"],
): Promise<SessionRow> {
  const row = {
    id: session.id,
    token: session.token,
    lastActive: session.updatedAt.valueOf(),
    device: "Unknown Device",
    type: "unknown",
    location: "",
  } satisfies SessionRow;

  if (session.ipAddress) {
    const res = await Promise.resolve(lookup(session.ipAddress));
    if (res) {
      row.location = joinStr([
        res.city,
        res.region1_name,
        res.country_name || res.country,
      ]);
    }
  }

  if (!session.userAgent) return row;
  const { device } = UAParser(session.userAgent);
  return {
    ...row,
    device: joinStr([device.vendor, device.model]),
    type: mapDeviceType(device.type),
  };
}

/**
 * @param type https://docs.uaparser.dev/info/device/type.html
 */
function mapDeviceType(
  type?:
    | "console"
    | "embedded"
    | "mobile"
    | "smarttv"
    | "tablet"
    | "wearable"
    | "xr",
): SessionRow["type"] {
  switch (type) {
    case "mobile":
      return "mobile";
    case "tablet":
      return "laptop";
    default:
      return "unknown";
  }
}

function joinStr(data: (string | undefined)[]) {
  return data.filter(Boolean).join(", ");
}

export const getPasskeys = cache(async () => {
  const passkeys = await auth.api.listPasskeys({ headers: await headers() });
  return passkeys.map<Passkey>((passkey, i) => ({
    id: passkey.id,
    name: passkey.name ?? `Unnamed Passkey ${i + 1}`,
    createdAt: passkey.createdAt.valueOf(),
  }));
});
