"use client";

import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import {
  DocList,
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
  SidebarRail,
  WorkspaceSwitcher,
} from "@notion-kit/sidebar";

import { useSettings } from "@/hooks/use-settings";
import { useWorkspaceList } from "@/hooks/use-workspace-list";

import { SettingsModal } from "./settings-modal";

export function AppSidebar() {
  const router = useRouter();
  const {
    settings: { account },
    signOut,
  } = useSettings();
  const { activeWorkspace, workspaceList, selectWorkspace } =
    useWorkspaceList();

  /** Actions */
  const { openModal } = useModal();
  const openSettings = () => openModal(<SettingsModal />);

  /** Keyboard shortcut */
  const shortcutOptions = { preventDefault: true };
  useHotkeys(["meta+comma", "shift+meta+comma"], openSettings, shortcutOptions);

  return (
    <Sidebar>
      <SidebarClose />
      <SidebarHeader>
        <div className="flex h-11 w-full shrink-0 grow-0 items-center justify-between">
          <WorkspaceSwitcher
            user={{
              id: account.id,
              name: account.name,
              avatarUrl: account.avatarUrl,
              email: account.email,
            }}
            activeWorkspace={activeWorkspace}
            workspaces={workspaceList}
            onCreateWorkspace={() => router.push("/onboarding")}
            onSelect={selectWorkspace}
            onLogout={signOut}
            onOpenSettings={openSettings}
          />
        </div>
        <SidebarGroup>
          <SidebarMenuItem
            icon={<Icon.MagnifyingGlass className="size-5.5" />}
            label="Search"
            hint="Search and quickly jump to a page"
            shortcut="⌘K"
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
        <DocList group="document" title="Document" pages={{}} />
      </SidebarContent>
      <SidebarFooter className="mb-10" />
      <SidebarRail />
    </Sidebar>
  );
}
