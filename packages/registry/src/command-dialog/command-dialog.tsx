"use client";

import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  CommandCollection,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItemAction,
} from "@notion-kit/ui/primitives";

const ACTIONS = [
  {
    value: "new-page",
    label: "New page",
    icon: <Icon.Plus className="size-4 fill-menu-icon" />,
    section: "Create",
    shortcut: "N",
  },
  {
    value: "invite",
    label: "Invite members",
    icon: <Icon.InviteMemberSmall className="size-4 fill-menu-icon" />,
    section: "Workspace",
    shortcut: "I",
  },
  {
    value: "archive",
    label: "Archive page",
    icon: <Icon.ArchiveBox className="size-4 fill-menu-icon" />,
    section: "Page",
    shortcut: "A",
  },
];

export default function CommandDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command</Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        items={ACTIONS}
        itemToStringValue={(action) => action.label}
        title="Workspace command palette"
      >
        <CommandInput search clear placeholder="Search actions..." />
        <CommandList>
          <CommandGroup heading="Actions" items={ACTIONS}>
            <CommandCollection>
              {(action: (typeof ACTIONS)[number]) => (
                <CommandItem
                  key={action.value}
                  value={action}
                  label={action.label}
                  icon={action.icon}
                  onClick={() => setOpen(false)}
                >
                  <MenuItemAction className="flex items-center gap-2 text-xs text-muted">
                    <span>{action.section}</span>
                    <span>{action.shortcut}</span>
                  </MenuItemAction>
                </CommandItem>
              )}
            </CommandCollection>
          </CommandGroup>
          <CommandEmpty>No commands found.</CommandEmpty>
        </CommandList>
      </CommandDialog>
    </>
  );
}
