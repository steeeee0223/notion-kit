"use server";

import type { Session } from "better-auth";
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
  await db.update(schema.session).set(payload);
}

function joinStr(data: (string | undefined)[]) {
  return data.filter(Boolean).join(", ");
}
