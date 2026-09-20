import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import type { DB } from "@/db/db";
import { emoji as emojiTable } from "@/db/schemas";
import type { SupabaseStorage } from "@/db/supabase";

import {
  contentTypeSchema,
  imageBase64Schema,
  imageExtensions,
  requireOrganizationAccess,
  resourceIdSchema,
} from "./resource-access";

const nameSchema = z.string().trim().min(1).max(64);
const BUCKET = "emojis";

interface EmojiPluginConfig {
  db: DB;
  storage: SupabaseStorage;
}

export function emoji({ db, storage }: EmojiPluginConfig) {
  return {
    id: "emoji",
    schema: {
      emoji: {
        fields: {
          organizationId: {
            type: "string",
            required: true,
            input: false,
            index: true,
            references: {
              model: "organization",
              field: "id",
              onDelete: "cascade",
            },
          },
          name: { type: "string", required: true, input: false },
          imageUrl: { type: "string", required: true, input: false },
          addedBy: {
            type: "string",
            required: true,
            input: false,
            index: true,
            references: { model: "user", field: "id", onDelete: "cascade" },
          },
          createdAt: {
            type: "date",
            required: true,
            input: false,
            defaultValue: () => new Date(),
          },
          updatedAt: {
            type: "date",
            required: true,
            input: false,
            defaultValue: () => new Date(),
            onUpdate: () => new Date(),
          },
        },
      },
    },
    endpoints: {
      listEmojis: createAuthEndpoint(
        "/emoji/list",
        {
          method: "GET",
          query: z.object({ organizationId: resourceIdSchema }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          await requireOrganizationAccess(
            ctx.context,
            ctx.context.session.user.id,
            ctx.query.organizationId,
          );
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
            organizationId: resourceIdSchema,
            name: nameSchema,
            imageBase64: imageBase64Schema,
            contentType: contentTypeSchema,
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          await requireOrganizationAccess(
            ctx.context,
            session.user.id,
            ctx.body.organizationId,
            true,
          );

          const emojiId = crypto.randomUUID();
          const ext = imageExtensions[ctx.body.contentType];
          const path = `${ctx.body.organizationId}/${emojiId}.${ext}`;
          const buffer = Buffer.from(ctx.body.imageBase64, "base64");

          const imageUrl = await storage.upload(
            BUCKET,
            path,
            buffer,
            ctx.body.contentType,
          );

          await db.insert(emojiTable).values({
            id: emojiId,
            organizationId: ctx.body.organizationId,
            name: ctx.body.name,
            imageUrl,
            addedBy: session.user.id,
          });
          return ctx.json({ id: emojiId, imageUrl });
        },
      ),
      updateEmoji: createAuthEndpoint(
        "/emoji/update",
        {
          method: "POST",
          body: z
            .object({
              id: resourceIdSchema,
              name: nameSchema.optional(),
              imageBase64: imageBase64Schema.optional(),
              contentType: contentTypeSchema.optional(),
            })
            .refine(
              (body) =>
                (body.imageBase64 !== undefined) ===
                (body.contentType !== undefined),
              "Image and content type must be provided together",
            )
            .refine(
              (body) =>
                body.name !== undefined || body.imageBase64 !== undefined,
              "An update is required",
            ),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const existing = await db.query.emoji.findFirst({
            where: eq(emojiTable.id, ctx.body.id),
            columns: { id: true, organizationId: true, imageUrl: true },
          });
          if (!existing)
            throw new APIError("NOT_FOUND", { message: "Emoji not found" });
          await requireOrganizationAccess(
            ctx.context,
            ctx.context.session.user.id,
            existing.organizationId,
            true,
          );

          const update: Record<string, unknown> = {};
          if (ctx.body.name !== undefined) update.name = ctx.body.name;

          if (ctx.body.imageBase64 && ctx.body.contentType) {
            const ext = imageExtensions[ctx.body.contentType];
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
            await db
              .update(emojiTable)
              .set(update)
              .where(eq(emojiTable.id, ctx.body.id));
          }
          return ctx.json({ ok: true });
        },
      ),
      deleteEmoji: createAuthEndpoint(
        "/emoji/delete",
        {
          method: "POST",
          body: z.object({ id: resourceIdSchema }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const existing = await db.query.emoji.findFirst({
            where: eq(emojiTable.id, ctx.body.id),
            columns: { id: true, organizationId: true, imageUrl: true },
          });
          if (!existing)
            throw new APIError("NOT_FOUND", { message: "Emoji not found" });
          await requireOrganizationAccess(
            ctx.context,
            ctx.context.session.user.id,
            existing.organizationId,
            true,
          );

          const url = new URL(existing.imageUrl);
          const storagePath = url.pathname.split(`${BUCKET}/`)[1];
          if (
            !storagePath ||
            !Object.values(imageExtensions).some(
              (ext) =>
                storagePath ===
                `${existing.organizationId}/${existing.id}.${ext}`,
            )
          ) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid emoji storage path",
            });
          }
          await storage.remove(BUCKET, [storagePath]);

          await db.delete(emojiTable).where(eq(emojiTable.id, ctx.body.id));
          return ctx.json({ ok: true });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
}
