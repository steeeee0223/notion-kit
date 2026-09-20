import type { AuthContext } from "better-auth";
import { APIError } from "better-auth/api";
import { z } from "zod/v4";

import { roles } from "../permissions";

const roleSchema = z.enum(["owner", "admin", "member", "guest"]);

export async function requireOrganizationAccess(
  context: Pick<AuthContext, "adapter">,
  userId: string,
  organizationId: string,
  write = false,
) {
  const member = await context.adapter.findOne<{ role: string }>({
    model: "member",
    where: [
      { field: "organizationId", value: organizationId },
      { field: "userId", value: userId },
    ],
  });
  if (!member)
    throw new APIError("FORBIDDEN", {
      message: "Organization membership required",
    });
  if (
    write &&
    !member.role.split(",").some((role) => {
      const parsed = roleSchema.safeParse(role);
      return (
        parsed.success &&
        roles[parsed.data].authorize({ organization: ["update"] }).success
      );
    })
  ) {
    throw new APIError("FORBIDDEN", {
      message: "Organization update permission required",
    });
  }
}

export const resourceIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const imageExtensions = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
} as const;
export const contentTypeSchema = z.enum([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);
const maxImageBytes = 5 * 1024 * 1024;
export const imageBase64Schema = z
  .string()
  .min(1)
  .max(Math.ceil(maxImageBytes / 3) * 4)
  .refine((value) => {
    const decoded = Buffer.from(value, "base64");
    return (
      decoded.length <= maxImageBytes && decoded.toString("base64") === value
    );
  }, "Expected a base64 image of at most 5 MiB");
