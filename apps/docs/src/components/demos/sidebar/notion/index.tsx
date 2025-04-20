"use client";

import React, { useState } from "react";
import { CirclePlus, Home, SearchIcon, SettingsIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { useModal } from "@notion-kit/modal";
import type { Page } from "@notion-kit/schemas";
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
  WorkspaceSwitcher,
} from "@notion-kit/sidebar";

import { GROUPS, pages, SHORTCUT_OPTIONS, user, workspaces } from "./data";

export default function NotionLayout() {
  return (
    <SidebarProvider className="h-full min-h-full">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
          <SidebarOpen />
          Navbar
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}

const AppSidebar = () => {
  const [activePage, setActivePage] = useState<string | null>(null);
  const selectPage = (page: Page) => setActivePage(page.id);
  /** Modals */
  const { openModal } = useModal();
  const [trashOpen, setTrashOpen] = useState(false);
  const openSearch = () =>
    openModal(
      <SearchCommand
        workspaceName={workspaces[0]!.name}
        pages={pages}
        onSelect={selectPage}
        onOpenTrash={() => setTrashOpen(true)}
      />,
    );
  /** Keyboard shortcut */
  useHotkeys(["meta+k", "shift+meta+k"], openSearch, SHORTCUT_OPTIONS);

  return (
    <Sidebar className="absolute z-0 h-full">
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
            icon={SearchIcon}
            label="Search"
            hint="Search and quickly jump to a page"
            shortcut="⌘K"
            onClick={openSearch}
          />
          <SidebarMenuItem
            icon={SettingsIcon}
            label="Settings"
            hint="Manage your account and settings"
            shortcut="⌘,"
          />
          <SidebarMenuItem
            icon={Home}
            label="Home"
            hint="View recent pages and more"
            shortcut="⌘^H"
          />
          <SidebarMenuItem
            icon={CirclePlus}
            label="New page"
            hint="Create a new document"
          />
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent className="mt-2 px-1">
        <FavoriteList
          pages={pages}
          activePage={activePage}
          onSelect={selectPage}
        />
        {Object.entries(GROUPS).map(([group, title]) => (
          <DocList
            key={group}
            group={group}
            title={title}
            pages={pages.filter(
              (page) => page.type === group && !page.isArchived,
            )}
            activePage={activePage}
            onSelect={selectPage}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <TrashBox
          isOpen={trashOpen}
          pages={pages}
          onOpenChange={setTrashOpen}
          onSelect={selectPage}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
