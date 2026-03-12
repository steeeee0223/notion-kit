import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { z } from "zod/v4";

import type { SupabaseStorage } from "../../db/supabase";

const BUCKET = "files";

function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return map[contentType] ?? "png";
}

export function fileUpload({ storage }: { storage: SupabaseStorage }) {
  return {
    id: "file-upload",
    endpoints: {
      uploadFile: createAuthEndpoint(
        "/file-upload/upload",
        {
          method: "POST",
          body: z.object({
            organizationId: z.string(),
            imageBase64: z.string(),
            contentType: z.string(),
            purpose: z.string(),
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const fileId = crypto.randomUUID();
          const ext = extFromContentType(ctx.body.contentType);
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
