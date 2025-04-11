"use client";

import React, { useState } from "react";
import { CirclePlus, Home, SearchIcon, SettingsIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { useModal } from "@notion-kit/modal";
import { Plan, Role } from "@notion-kit/schemas";
import type { IconData, Page, User, Workspace } from "@notion-kit/schemas";

import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "./layout";
import {
  DocList,
  FavoriteList,
  SearchCommand,
  TrashBox,
  WorkspaceSwitcher,
} from "./presets";

const GROUPS = {
  document: "Document",
  kanban: "Kanban",
  whiteboard: "Whiteboard",
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

interface SidebarProps {
  ref?: React.Ref<HTMLElement>;
  className?: string;
  workspace: {
    name: string;
    icon: IconData;
  };
  onOpenSettings: () => void;
}

export const SidebarDemo: React.FC<SidebarProps> = ({ ...props }) => {
  const [open, setOpen] = useState(true);
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar {...props} />
      <SidebarInset>
        <nav>Navbar</nav>
        <div>Main</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

const AppSidebar: React.FC<SidebarProps> = ({
  ref,
  className,
  workspace,
  onOpenSettings,
}) => {
  const pages: Page[] = [];
  const [activePage, setActivePage] = useState<string | null>(null);
  const selectPage = (page: Page) => setActivePage(page.id);
  /** Modals */
  const { openModal } = useModal();
  const [trashOpen, setTrashOpen] = useState(false);
  const onOpenSearch = () =>
    openModal(
      <SearchCommand
        workspaceName={workspace.name}
        pages={pages}
        onSelect={selectPage}
        onOpenTrash={setTrashOpen}
      />,
    );
  /** Keyboard shortcut */
  useHotkeys(["meta+k", "shift+meta+k"], onOpenSearch, SHORTCUT_OPTIONS);
  useHotkeys(
    ["meta+comma", "shift+meta+comma"],
    onOpenSettings,
    SHORTCUT_OPTIONS,
  );

  return (
    <Sidebar ref={ref} className={className}>
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
            description={[
              { type: "default", text: "Search and quickly jump to a page" },
              { type: "secondary", text: "⌘K" },
            ]}
            onClick={onOpenSearch}
          />
          <SidebarMenuItem
            icon={SettingsIcon}
            label="Settings"
            description={[
              { type: "default", text: "Manage your account and settings" },
              { type: "secondary", text: "⌘," },
            ]}
            onClick={onOpenSettings}
          />
          <SidebarMenuItem
            icon={Home}
            label="Home"
            description={[
              { type: "default", text: "View recent pages and more" },
              { type: "secondary", text: "⌘^H" },
            ]}
          />
          <SidebarMenuItem
            icon={CirclePlus}
            label="New page"
            description="Create a new document"
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
