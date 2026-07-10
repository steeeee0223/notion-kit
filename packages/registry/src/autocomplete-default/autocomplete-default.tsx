"use client";

import { Icon } from "@notion-kit/icons";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  MenuItemAction,
} from "@notion-kit/ui/primitives";

const PAGES = ["Project plan", "Release notes", "Design system"];
const ACTIONS = ["Invite members", "Archive page", "Export workspace"];

const GROUPS = [
  {
    label: "Pages",
    items: PAGES,
    icon: <Icon.Newspaper className="size-4 fill-menu-icon" />,
  },
  {
    label: "Actions",
    items: ACTIONS,
    icon: <Icon.Lightning className="size-4 fill-menu-icon" />,
  },
];

export default function AutocompleteDefault() {
  return (
    <div className="w-80">
      <Autocomplete<string>
        items={GROUPS}
        open
        autoHighlight="always"
        openOnInputClick
      >
        <AutocompleteInput search clear placeholder="Search workspace..." />
        <AutocompleteContent>
          <AutocompleteEmpty>No matches found.</AutocompleteEmpty>
          <AutocompleteList>
            {(group: (typeof GROUPS)[number]) => (
              <AutocompleteGroup key={group.label} items={group.items}>
                <AutocompleteLabel title={group.label} />
                <AutocompleteCollection>
                  {(item: string) => (
                    <AutocompleteItem
                      key={item}
                      value={item}
                      label={item}
                      icon={group.icon}
                    >
                      <MenuItemAction className="text-xs text-muted">
                        {group.label.slice(0, -1)}
                      </MenuItemAction>
                    </AutocompleteItem>
                  )}
                </AutocompleteCollection>
              </AutocompleteGroup>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  );
}
