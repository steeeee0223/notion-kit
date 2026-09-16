import { z } from "zod";

import type { ColumnInfo } from "@notion-kit/table-hook";

export function isUsableDateProperty(property: ColumnInfo) {
  return property.type === "date" && !property.hidden && !property.isDeleted;
}

export function resolveDateProperty(
  properties: ColumnInfo[],
  persistedId: string | null,
) {
  return (
    properties.find(
      (property) =>
        property.id === persistedId && isUsableDateProperty(property),
    ) ??
    properties.find(isUsableDateProperty) ??
    null
  );
}

const timeZoneConfig = z.object({ tz: z.string().optional() });

export function getDatePropertyTimeZone(property: ColumnInfo) {
  const config = timeZoneConfig.safeParse(property.config);
  const timeZone = config.success ? config.data.tz : undefined;
  try {
    return new Intl.DateTimeFormat("en", { timeZone }).resolvedOptions()
      .timeZone;
  } catch {
    return "UTC";
  }
}
