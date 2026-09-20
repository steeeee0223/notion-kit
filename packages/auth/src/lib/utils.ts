import type { DBFieldAttribute } from "better-auth/db";
import { z } from "zod/v4";

import { IconObject } from "@notion-kit/schemas";

type AdditionalFields = Record<string, DBFieldAttribute>;

export const additionalUserFields = {
  preferredName: { type: "string", required: false },
  lang: { type: "string", defaultValue: "en" },
  tz: { type: "string", required: false },
} satisfies AdditionalFields;

export const additionalTeamFields = {
  icon: {
    type: "string",
    required: true,
    validator: {
      input: z.string().refine((value) => {
        try {
          return IconObject.safeParse(JSON.parse(value)).success;
        } catch {
          return false;
        }
      }, "Invalid team icon"),
    },
  },
  description: { type: "string", required: false },
  permission: {
    type: ["default", "open", "closed", "private"],
    required: true,
  },
  ownedBy: {
    type: "string",
    required: true,
    input: false,
    references: { model: "user", field: "id", onDelete: "cascade" },
  },
} satisfies AdditionalFields;
