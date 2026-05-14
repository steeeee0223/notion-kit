import type { DBFieldAttribute } from "better-auth/db";

type AdditionalFields = Record<string, DBFieldAttribute>;

export const additionalUserFields = {
  preferredName: { type: "string" },
  lang: { type: "string", defaultValue: "en" },
  tz: { type: "string", required: false },
} satisfies AdditionalFields;

export const additionalSessionFields = {
  deviceVendor: { type: "string", required: false },
  deviceModel: { type: "string", required: false },
  deviceType: { type: "string", required: false },
  location: { type: "string", required: false },
} satisfies AdditionalFields;

export const additionalTeamFields = {
  icon: { type: "string", required: true },
  description: { type: "string", required: false },
  permission: { type: "string", required: true },
  ownedBy: { type: "string", required: true },
} satisfies AdditionalFields;

export const additionalTeamMemberFields = {
  role: { type: "string", required: true },
} satisfies AdditionalFields;

/**
 * Converts a display name to a URL-friendly slug base.
 */
export function toSlugLike(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
