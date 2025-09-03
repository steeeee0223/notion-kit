import type { FieldAttribute } from "better-auth/db";

type AdditionalFields = Record<string, FieldAttribute>;

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

export const additionalAccountFields = {
  username: { type: "string", required: false },
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
