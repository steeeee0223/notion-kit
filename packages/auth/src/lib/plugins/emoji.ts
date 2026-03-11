import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import type { DB } from "@/db/db";
import { emoji as emojiTable } from "@/db/schemas";
import type { SupabaseStorage } from "@/db/supabase";

const BUCKET = "emojis";

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

interface EmojiPluginConfig {
  db: DB;
  storage: SupabaseStorage;
}

export function emoji({ db, storage }: EmojiPluginConfig) {
  return {
    id: "emoji",
    endpoints: {
      listEmojis: createAuthEndpoint(
        "/emoji/list",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) throw new Error("Unauthorized");

          const rows = await db.query.emoji.findMany({
            where: eq(emojiTable.organizationId, ctx.query.organizationId),
            with: { user: { columns: { name: true } } },
          });
          return ctx.json(
            rows.map((r) => ({
              id: r.id,
              name: r.name,
              imageUrl: r.imageUrl,
              addedByName: r.user.name,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
            })),
          );
        },
      ),
      addEmoji: createAuthEndpoint(
        "/emoji/add",
        {
          method: "POST",
          body: z.object({
            organizationId: z.string(),
            name: z.string(),
            imageBase64: z.string(),
            contentType: z.string(),
          }),
          requireHeaders: true,
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) throw new Error("Unauthorized");

          const emojiId = crypto.randomUUID();
          const ext = extFromContentType(ctx.body.contentType);
          const path = `${ctx.body.organizationId}/${emojiId}.${ext}`;
          const buffer = Buffer.from(ctx.body.imageBase64, "base64");

          const imageUrl = await storage.upload(
            BUCKET,
            path,
            buffer,
            ctx.body.contentType,
          );

          await ctx.context.adapter.create({
            model: "emoji",
            data: {
              id: emojiId,
              organizationId: ctx.body.organizationId,
              name: ctx.body.name,
              imageUrl,
              addedBy: session.user.id,
            },
          });
          return ctx.json({ id: emojiId, imageUrl });
        },
      ),
      updateEmoji: createAuthEndpoint(
        "/emoji/update",
        {
          method: "POST",
          body: z.object({
            id: z.string(),
            name: z.string().optional(),
            imageBase64: z.string().optional(),
            contentType: z.string().optional(),
          }),
          requireHeaders: true,
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) throw new Error("Unauthorized");

          const existing = await ctx.context.adapter.findOne<{
            id: string;
            organizationId: string;
            imageUrl: string;
          }>({
            model: "emoji",
            where: [{ field: "id", value: ctx.body.id }],
          });
          if (!existing) throw new Error("Emoji not found");

          const update: Record<string, unknown> = {};
          if (ctx.body.name !== undefined) update.name = ctx.body.name;

          if (ctx.body.imageBase64 && ctx.body.contentType) {
            const ext = extFromContentType(ctx.body.contentType);
            const path = `${existing.organizationId}/${existing.id}.${ext}`;
            const buffer = Buffer.from(ctx.body.imageBase64, "base64");
            const imageUrl = await storage.upload(
              BUCKET,
              path,
              buffer,
              ctx.body.contentType,
            );
            update.imageUrl = imageUrl;
          }

          if (Object.keys(update).length > 0) {
            await ctx.context.adapter.update({
              model: "emoji",
              where: [{ field: "id", value: ctx.body.id }],
              update,
            });
          }
          return ctx.json({ ok: true });
        },
      ),
      deleteEmoji: createAuthEndpoint(
        "/emoji/delete",
        {
          method: "POST",
          body: z.object({ id: z.string() }),
          requireHeaders: true,
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) throw new Error("Unauthorized");

          const existing = await ctx.context.adapter.findOne<{
            id: string;
            organizationId: string;
            imageUrl: string;
          }>({
            model: "emoji",
            where: [{ field: "id", value: ctx.body.id }],
          });
          if (!existing) throw new Error("Emoji not found");

          const url = new URL(existing.imageUrl);
          const storagePath = url.pathname.split(`${BUCKET}/`)[1];
          if (storagePath) {
            await storage.remove(BUCKET, [storagePath]);
          }

          await ctx.context.adapter.delete({
            model: "emoji",
            where: [{ field: "id", value: ctx.body.id }],
          });
          return ctx.json({ ok: true });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
}
