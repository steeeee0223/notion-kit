import { z } from "zod/v4";

import { Role } from "@notion-kit/schemas";

export const emailSchema = z.email();
export const addMembersSchema = z.object({
  _emailInput: z.string(),
  emails: z.array(emailSchema).min(1),
  role: z.enum([Role.OWNER, Role.MEMBER]),
  message: z.string().optional(),
});
export type AddMembersSchema = z.infer<typeof addMembersSchema>;
