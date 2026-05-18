import { createFetch, createSchema } from "@better-fetch/fetch";
import { z } from "zod/v4";

import { upstreamError } from "@/lib/api-error";
import type { Bbox } from "@/lib/schemas";

const transitlandFeedSchema = z
  .object({
    onestop_id: z.string().optional(),
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().nullable().optional(),
    spec: z.string().nullable().optional(),
    urls: z.record(z.string(), z.unknown()).nullable().optional(),
    feed_state: z
      .object({
        feed_version: z
          .object({
            sha1: z.string().nullable().optional(),
            fetched_at: z.string().nullable().optional(),
            url: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

const transitlandFeedsResponseSchema = z
  .object({
    feeds: transitlandFeedSchema.array().optional(),
  })
  .passthrough();

export type TransitlandFeed = z.infer<typeof transitlandFeedSchema>;

export class TransitlandClient {
  private readonly baseUrl = "https://transit.land/api/v2/rest";

  constructor(private readonly apiKey: string) {}

  async discoverFeeds(input: { bbox?: Bbox; feedIds?: string[] }) {
    if (input.feedIds?.length) {
      const feeds = await Promise.all(
        input.feedIds.map((feedId) => this.getFeed(feedId)),
      );
      return feeds;
    }

    const $fetch = createFetch({ baseURL: this.baseUrl });
    const { data, error } = await $fetch<unknown>("/feeds", {
      query: {
        apikey: this.apiKey,
        spec: "gtfs",
        ...(input.bbox ? { bbox: input.bbox.join(",") } : {}),
      },
    });
    if (error) throw upstreamError("Transitland feed discovery failed", error);
    return transitlandFeedsResponseSchema.parse(data).feeds ?? [];
  }

  async getFeed(feedId: string) {
    const $fetch = createFetch({ baseURL: this.baseUrl });
    const { data, error } = await $fetch<unknown>(
      `/feeds/${encodeURIComponent(feedId)}`,
      { query: { apikey: this.apiKey } },
    );
    if (error) throw upstreamError("Transitland feed lookup failed", error);
    const parsed = transitlandFeedsResponseSchema.parse(data);
    const feed = parsed.feeds?.[0];
    if (!feed)
      throw upstreamError("Transitland feed not found", {
        feedId,
        status: 404,
      });
    return feed;
  }

  async downloadLatestFeedVersion(feedId: string) {
    const $fetch = createFetch({
      baseURL: this.baseUrl,
      schema: createSchema({
        "/feeds/:feedId/download_latest_feed_version": {
          output: z.instanceof(ArrayBuffer),
        },
      }),
    });
    const { data, error } = await $fetch(
      "/feeds/:feedId/download_latest_feed_version",
      {
        params: { feedId: encodeURIComponent(feedId) },
        query: { apikey: this.apiKey },
      },
    );
    if (error) throw upstreamError("Transitland GTFS download failed", error);
    return Buffer.from(data);
  }
}

export function getFeedOnestopId(feed: TransitlandFeed) {
  return feed.onestop_id ?? String(feed.id ?? "");
}

export function getFeedVersion(feed: TransitlandFeed) {
  return feed.feed_state?.feed_version ?? null;
}

export function getFeedUrl(feed: TransitlandFeed, key: string) {
  const value = feed.urls?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}
