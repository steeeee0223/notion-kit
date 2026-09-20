"use client";

import { useMemo } from "react";

import type { EmojiAdapter, Emojis } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";
import { fileToBase64 } from "../lib/file";

export function useEmojiAdapter(): EmojiAdapter | undefined {
  const { auth } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const emojiApi = auth.emoji;

  return useMemo<EmojiAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    return {
      getAll: async (): Promise<Emojis> => {
        const { data, error } = await emojiApi.list({
          query: { organizationId },
        });
        if (error) throw new Error(error.message);
        return Object.fromEntries(
          data.map(
            (e: {
              id: string;
              name: string;
              imageUrl: string;
              addedByName: string;
              createdAt: Date;
              updatedAt: Date;
            }) => [
              e.id,
              {
                id: e.id,
                name: e.name,
                src: `${e.imageUrl}?v=${new Date(e.updatedAt).valueOf()}`,
                createdBy: e.addedByName,
                createdAt: new Date(e.createdAt).valueOf(),
              },
            ],
          ),
        );
      },
      add: async ({ name, file }) => {
        const { imageBase64, contentType } = await fileToBase64(file);
        await emojiApi.add(
          {
            organizationId,
            name,
            imageBase64,
            contentType,
          },
          { throw: true },
        );
      },
      update: async ({ id, name, file }) => {
        const payload: {
          id: string;
          name?: string;
          imageBase64?: string;
          contentType?: Awaited<ReturnType<typeof fileToBase64>>["contentType"];
        } = { id };
        if (name !== undefined) payload.name = name;
        if (file) {
          const { imageBase64, contentType } = await fileToBase64(file);
          payload.imageBase64 = imageBase64;
          payload.contentType = contentType;
        }
        await emojiApi.update(payload, { throw: true });
      },
      delete: async (id) => {
        await emojiApi.delete({ id }, { throw: true });
      },
    };
  }, [emojiApi, organizationId]);
}
