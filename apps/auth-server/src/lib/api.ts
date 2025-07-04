"use server";

import { cache } from "react";
import { headers } from "next/headers";

import type { Passkey, SessionRow } from "@notion-kit/settings-panel";

import { auth } from "./auth";

export const listSessions = cache(async () => {
  const sessions = await auth.api.listSessions({ headers: await headers() });
  return sessions.map((session) => ({
    id: session.id,
    token: session.token,
    lastActive: session.updatedAt.valueOf(),
    device:
      joinStr([session.deviceVendor, session.deviceModel]) || "Unknown Device",
    type: mapDeviceType(session.deviceType),
    location: session.location ?? "",
  }));
});

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

export const getPasskeys = cache(async () => {
  const passkeys = await auth.api.listPasskeys({ headers: await headers() });
  return passkeys.map<Passkey>((passkey, i) => ({
    id: passkey.id,
    name: passkey.name ?? `Unnamed Passkey ${i + 1}`,
    createdAt: passkey.createdAt.valueOf(),
  }));
});
