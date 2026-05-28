import { useEffect } from "react";

import { cn } from "@notion-kit/cn";
import { MenuGroup, MenuItem, MenuLabel } from "@notion-kit/ui/primitives";

import {
  toStaticFeedSelection,
  type StaticFeedCandidate,
  type StaticFeedSelection,
} from "@/adapters/transitland/use-static-feeds";
import * as GoogleIcon from "@/components/google-icons";

import { FeedStatusMessage, PanelMessage } from "./message";
import { StaticFeedCandidates } from "./static-feed-candidates";

interface TransitStaticFeedProps {
  bbox: string;
  candidates: StaticFeedCandidate[];
  error: unknown;
  isLoading: boolean;
  isSyncing: boolean;
  isStaticFeedSource: boolean;
  message: string | null;
  selectedFeed: StaticFeedSelection | null;
  sourceLabel: string;
  onSelectFeed: (feed: StaticFeedSelection | null) => void;
  onSync: () => void;
}

export function TransitStaticFeed({
  bbox,
  candidates,
  error,
  isLoading,
  isSyncing,
  isStaticFeedSource,
  message,
  selectedFeed,
  sourceLabel,
  onSelectFeed,
  onSync,
}: TransitStaticFeedProps) {
  useEffect(() => {
    if (!isStaticFeedSource || isLoading) return;
    if (candidates.length === 1) {
      const candidate = candidates[0];
      if (!candidate) return;
      const next = toStaticFeedSelection(candidate);
      if (shouldReplaceSelectedFeed(selectedFeed, next)) {
        onSelectFeed(next);
      }
      return;
    }
    const selectedCandidate = candidates.find(
      (candidate) => candidate.feed_onestop_id === selectedFeed?.feedOnestopId,
    );
    if (selectedCandidate) {
      const next = toStaticFeedSelection(selectedCandidate);
      if (shouldReplaceSelectedFeed(selectedFeed, next)) {
        onSelectFeed(next);
      }
      return;
    }
    if (
      selectedFeed &&
      candidates.length > 1 &&
      !candidates.some(
        (candidate) => candidate.feed_onestop_id === selectedFeed.feedOnestopId,
      )
    ) {
      onSelectFeed(null);
    }
  }, [candidates, isLoading, isStaticFeedSource, onSelectFeed, selectedFeed]);

  const shouldShowSync = selectedFeed?.status !== "current";

  return (
    <MenuGroup>
      <MenuLabel>Feed</MenuLabel>
      {!isStaticFeedSource && (
        <PanelMessage message="Static feeds are available for transport providers only." />
      )}
      {isStaticFeedSource && !bbox && (
        <PanelMessage message="Move the map before loading feeds." />
      )}
      {isStaticFeedSource && Boolean(error) && (
        <PanelMessage message="Failed to load feed." />
      )}
      {isStaticFeedSource && selectedFeed && (
        <FeedStatusMessage
          label={
            selectedFeed.name ??
            `${sourceLabel} · ${selectedFeed.feedOnestopId}`
          }
          status={selectedFeed.status}
        />
      )}
      {message && <PanelMessage message={message} muted />}

      {isStaticFeedSource && (
        <StaticFeedCandidates
          candidates={candidates}
          selectedFeedLabel={selectedFeed?.name ?? selectedFeed?.feedOnestopId}
          selectedFeedOnestopId={selectedFeed?.feedOnestopId ?? null}
          onSelect={(candidate) =>
            onSelectFeed(toStaticFeedSelection(candidate))
          }
        />
      )}

      {shouldShowSync && (
        <MenuItem
          Icon={
            <GoogleIcon.Sync
              className={cn("size-4", isSyncing && "animate-spin")}
            />
          }
          Body="Sync feed"
          disabled={!isStaticFeedSource || isSyncing}
          onClick={onSync}
        />
      )}
    </MenuGroup>
  );
}

function shouldReplaceSelectedFeed(
  current: StaticFeedSelection | null,
  next: StaticFeedSelection,
) {
  return (
    current?.feedOnestopId !== next.feedOnestopId ||
    current.status !== next.status ||
    current.counts.routes !== next.counts.routes ||
    current.counts.stops !== next.counts.stops ||
    current.counts.trips !== next.counts.trips
  );
}
