"use client";

import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import {
  DocList,
  FavoriteList,
  SearchCommand,
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenuItem,
  SidebarOpen,
  SidebarProvider,
  SidebarRail,
  TrashBox,
  usePages,
  WorkspaceSwitcher,
} from "@notion-kit/sidebar";

import {
  pages as allPages,
  GROUPS,
  SHORTCUT_OPTIONS,
  user,
  workspaces,
} from "./data";

export const SidebarDemo = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
          <SidebarOpen />
          Navbar
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
};

const AppSidebar = () => {
  const pages = usePages({ pages: allPages });

  /** Modals */
  const { openModal } = useModal();
  const [trashOpen, setTrashOpen] = useState(false);
  const onOpenSearch = () =>
    openModal(
      <SearchCommand
        workspaceName={workspaces[0]!.name}
        pages={allPages}
        onSelect={(page) => pages.setActive(page.id)}
        onOpenTrash={() => setTrashOpen(true)}
      />,
    );
  /** Keyboard shortcut */
  useHotkeys(["meta+k", "shift+meta+k"], onOpenSearch, SHORTCUT_OPTIONS);

  return (
    <Sidebar>
      <SidebarClose />
      <SidebarHeader>
        <div className="flex h-11 w-full shrink-0 grow-0 items-center justify-between">
          <WorkspaceSwitcher
            user={user}
            activeWorkspace={workspaces[0]!}
            workspaces={workspaces}
          />
        </div>
        <SidebarGroup>
          <SidebarMenuItem
            icon={<Icon.MagnifyingGlass className="size-5.5" />}
            label="Search"
            hint="Search and quickly jump to a page"
            shortcut="⌘K"
            onClick={onOpenSearch}
          />
          <SidebarMenuItem
            icon={<Icon.Gear className="size-5.5" />}
            label="Settings"
            hint="Manage your account and settings"
            shortcut="⌘,"
          />
          <SidebarMenuItem
            icon={<Icon.Home className="size-5.5" />}
            label="Home"
            hint="View recent pages and more"
            shortcut="⌘^H"
          />
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <FavoriteList
          pages={pages.favorites()}
          activePage={pages.state.active}
          onSelect={(page) => pages.setActive(page.id)}
        />
        {Object.entries(GROUPS).map(([group, title]) => (
          <DocList
            key={group}
            group={group}
            title={title}
            pages={pages.visibleByGroup(group)}
            activePage={pages.state.active}
            onSelect={(page) => pages.setActive(page.id)}
            onUpdate={pages.update}
          />
        ))}
      </SidebarContent>
      <SidebarFooter className="mb-10">
        <TrashBox
          isOpen={trashOpen}
          pages={pages.archivedPages()}
          onOpenChange={setTrashOpen}
          onSelect={(page) => pages.setActive(page.id)}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
