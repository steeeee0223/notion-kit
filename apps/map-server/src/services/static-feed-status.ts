import type { StaticFeedCounts } from "@/services/gtfs/data-transfer";
import { getFeedsByIds, getStaticFeedCounts } from "@/services/repository";
import {
  getFeedOnestopId,
  getFeedVersion,
  type TransitlandFeed,
} from "@/services/transitland/client";

export type StaticFeedStatusValue = "missing" | "current" | "stale" | "unknown";

export interface StaticFeedStatusCandidate {
  feed_lookup_key: string;
  feed_onestop_id: string;
  name: string | null;
  spec: string | null;
  status: StaticFeedStatusValue;
  is_strong_match: boolean;
  version: {
    sha1: string | null;
    fetched_at: string | null;
  };
  local: {
    exists: boolean;
    sha1: string | null;
    fetched_at: string | null;
    last_static_sync: string | null;
    counts: StaticFeedCounts;
  };
}

export async function buildStaticFeedStatusCandidates(
  feeds: TransitlandFeed[],
) {
  const candidates = feeds
    .map((feed) => ({
      feed,
      feedOnestopId: getFeedOnestopId(feed),
    }))
    .filter((candidate) => candidate.feedOnestopId.length > 0);

  const existingFeeds = await getFeedsByIds(
    candidates.map((candidate) => candidate.feedOnestopId),
  );
  const countsByFeed = new Map<string, StaticFeedCounts>();

  await Promise.all(
    candidates.map(async ({ feedOnestopId }) => {
      countsByFeed.set(feedOnestopId, await getStaticFeedCounts(feedOnestopId));
    }),
  );

  return candidates.map(({ feed, feedOnestopId }) => {
    const existing = existingFeeds.get(feedOnestopId);
    const counts = countsByFeed.get(feedOnestopId) ?? emptyCounts();
    const version = getFeedVersion(feed);
    const status = getStaticFeedStatus({
      remoteSha1: version?.sha1 ?? null,
      localSha1: existing?.sha1Current ?? null,
      localExists: Boolean(existing),
      counts,
    });

    return {
      feed_lookup_key: feedOnestopId,
      feed_onestop_id: feedOnestopId,
      name: feed.name ?? existing?.name ?? null,
      spec: feed.spec ?? existing?.spec ?? null,
      status,
      is_strong_match: candidates.length === 1,
      version: {
        sha1: version?.sha1 ?? null,
        fetched_at: version?.fetched_at ?? null,
      },
      local: {
        exists: Boolean(existing),
        sha1: existing?.sha1Current ?? null,
        fetched_at: existing?.fetchedAt?.toISOString() ?? null,
        last_static_sync: existing?.lastStaticSync?.toISOString() ?? null,
        counts,
      },
    } satisfies StaticFeedStatusCandidate;
  });
}

function getStaticFeedStatus(input: {
  remoteSha1: string | null;
  localSha1: string | null;
  localExists: boolean;
  counts: StaticFeedCounts;
}): StaticFeedStatusValue {
  const hasReadableRows =
    input.counts.stops > 0 && input.counts.routes > 0 && input.counts.trips > 0;
  if (!input.localExists || !hasReadableRows) return "missing";
  if (!input.remoteSha1) return "unknown";
  return input.remoteSha1 === input.localSha1 ? "current" : "stale";
}

function emptyCounts(): StaticFeedCounts {
  return {
    stops: 0,
    routes: 0,
    trips: 0,
    stopTimes: 0,
  };
}
