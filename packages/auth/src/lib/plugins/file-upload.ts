import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { z } from "zod/v4";

import type { SupabaseStorage } from "../../db/supabase";
import {
  contentTypeSchema,
  imageBase64Schema,
  imageExtensions,
  requireOrganizationAccess,
  resourceIdSchema,
} from "./resource-access";

const BUCKET = "files";

export function fileUpload({ storage }: { storage: SupabaseStorage }) {
  return {
    id: "file-upload",
    endpoints: {
      uploadFile: createAuthEndpoint(
        "/file-upload/upload",
        {
          method: "POST",
          body: z.object({
            organizationId: resourceIdSchema,
            imageBase64: imageBase64Schema,
            contentType: contentTypeSchema,
            purpose: z.literal("workspace-icon"),
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          await requireOrganizationAccess(
            ctx.context,
            ctx.context.session.user.id,
            ctx.body.organizationId,
            true,
          );
          const fileId = crypto.randomUUID();
          const ext = imageExtensions[ctx.body.contentType];
          const path = `${ctx.body.organizationId}/${ctx.body.purpose}/${fileId}.${ext}`;
          const buffer = Buffer.from(ctx.body.imageBase64, "base64");

          const url = await storage.upload(
            BUCKET,
            path,
            buffer,
            ctx.body.contentType,
          );

          return ctx.json({ url });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
}
