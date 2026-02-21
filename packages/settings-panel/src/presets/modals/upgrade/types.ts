import { z } from "zod/v4";

export interface Plan {
  name: string;
  monthly: number;
  annual: number;
}

export const upgradeSchema = z.object({
  name: z.string(),
  businessName: z.string(),
  vatId: z.string(),
  billingInterval: z.enum(["month", "year"]),
  termsAccepted: z.literal(true, {
    error: "You must accept the terms to continue",
  }),
});

export type UpgradeSchema = z.infer<typeof upgradeSchema>;
