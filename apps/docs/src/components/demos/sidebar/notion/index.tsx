"use client";

import { useState } from "react";
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
  pages as data,
  GROUPS,
  SHORTCUT_OPTIONS,
  user,
  workspaces,
} from "./data";

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
  const pages = usePages({ pages: data });
  /** Modals */
  const { openModal } = useModal();
  const [trashOpen, setTrashOpen] = useState(false);
  const openSearch = () =>
    openModal(
      <SearchCommand
        workspaceName={workspaces[0]!.name}
        pages={pages.visiblePages()}
        onSelect={(p) => pages.setActive(p.id)}
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
            icon={<Icon.MagnifyingGlass className="size-5.5" />}
            label="Search"
            hint="Search and quickly jump to a page"
            shortcut="⌘K"
            onClick={openSearch}
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
      <SidebarContent className="mt-2 px-1">
        <FavoriteList
          pages={pages.favorites()}
          activePage={pages.state.active}
          onSelect={(p) => pages.setActive(p.id)}
          onUpdate={pages.update}
        />
        {Object.entries(GROUPS).map(([group, title]) => (
          <DocList
            key={group}
            group={group}
            title={title}
            pages={pages.visibleByGroup(group)}
            activePage={pages.state.active}
            onSelect={(p) => pages.setActive(p.id)}
            onUpdate={pages.update}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <TrashBox
          isOpen={trashOpen}
          pages={pages.archivedPages()}
          onOpenChange={setTrashOpen}
          onSelect={(p) => pages.setActive(p.id)}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
