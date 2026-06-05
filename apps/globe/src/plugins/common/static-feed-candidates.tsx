import { Icon } from "@notion-kit/icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemAction,
} from "@notion-kit/ui/primitives";

import { StaticFeedCandidate } from "@/adapters/transitland/use-static-feeds";
import * as GoogleIcon from "@/components/google-icons";

export function StaticFeedCandidates({
  candidates,
  selectedFeedLabel,
  selectedFeedOnestopId,
  onSelect,
}: {
  candidates: StaticFeedCandidate[];
  selectedFeedLabel?: string | null;
  selectedFeedOnestopId: string | null;
  onSelect: (candidate: StaticFeedCandidate) => void;
}) {
  const visibleCandidates = candidates.slice(0, 5);
  const selectedCandidate = candidates.find(
    (candidate) => candidate.feed_onestop_id === selectedFeedOnestopId,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <MenuItem
            Icon={<GoogleIcon.DataExploration className="size-4" />}
            Body={
              selectedCandidate?.name ??
              selectedCandidate?.feed_onestop_id ??
              selectedFeedLabel ??
              "Select feed"
            }
          >
            <MenuItemAction>
              <Icon.Chevron side="down" className="size-3 fill-icon" />
            </MenuItemAction>
          </MenuItem>
        }
      />
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Feed Candidates</DropdownMenuLabel>
          {visibleCandidates.map((candidate) => (
            <DropdownMenuCheckboxItem
              key={candidate.feed_onestop_id}
              checked={candidate.feed_onestop_id === selectedFeedOnestopId}
              label={candidate.name ?? candidate.feed_onestop_id}
              desc={`${candidate.status} · ${candidate.local.counts.stops} stops`}
              onCheckedChange={() => onSelect(candidate)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
