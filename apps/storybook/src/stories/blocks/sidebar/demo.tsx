"use client";

import React, { useState } from "react";
import { CirclePlus, Home, SearchIcon, SettingsIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { HintProvider } from "@notion-kit/common";
import { ModalProvider, useModal } from "@notion-kit/modal";
import { Plan, Role } from "@notion-kit/schemas";
import type { Page, User, Workspace } from "@notion-kit/schemas";
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

const GROUPS = {
  document: "Document",
  private: "Private",
  shared: "Shared",
} as const;

const SHORTCUT_OPTIONS = { preventDefault: true };

const user: User = {
  id: "u1",
  name: "Admin",
  email: "admin@email.com",
  avatarUrl: "",
};
const workspaces: Workspace[] = [
  {
    id: "w1",
    name: "Workspace",
    role: Role.OWNER,
    memberCount: 5,
    plan: Plan.FREE,
  },
  {
    id: "w2",
    name: "Workspace 2",
    role: Role.GUEST,
    memberCount: 2,
    plan: Plan.EDUCATION,
  },
  {
    id: "w3",
    name: "Workspace 3",
    role: Role.OWNER,
    memberCount: 10,
    plan: Plan.ENTERPRISE,
  },
  {
    id: "w4",
    name: "Workspace 4",
    role: Role.MEMBER,
    memberCount: 12,
    plan: Plan.PLUS,
  },
];

export const SidebarDemo = () => {
  return (
    <SidebarProvider>
      <HintProvider>
        <ModalProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
              <SidebarOpen />
              Navbar
            </header>
          </SidebarInset>
        </ModalProvider>
      </HintProvider>
    </SidebarProvider>
  );
};

const AppSidebar = () => {
  const pages: Page[] = [];
  const [activePage, setActivePage] = useState<string | null>(null);
  const selectPage = (page: Page) => setActivePage(page.id);
  /** Modals */
  const { openModal } = useModal();
  const [trashOpen, setTrashOpen] = useState(false);
  const onOpenSearch = () =>
    openModal(
      <SearchCommand
        workspaceName={workspaces[0]!.name}
        pages={pages}
        onSelect={selectPage}
        onOpenTrash={setTrashOpen}
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
            icon={SearchIcon}
            label="Search"
            hint="Search and quickly jump to a page"
            shortcut="⌘K"
            onClick={onOpenSearch}
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
      <SidebarContent>
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
            pages={pages}
            activePage={activePage}
            onSelect={selectPage}
          />
        ))}
      </SidebarContent>
      <SidebarFooter className="mb-10">
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
