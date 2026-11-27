"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

import { WorkspaceSwitcher } from "@notion-kit/auth-ui";
import { Icon } from "@notion-kit/icons";
import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
  SidebarRail,
} from "@notion-kit/ui/sidebar";
import { DocList } from "@notion-kit/ui/sidebar/presets";

import { SettingsModal } from "./settings-modal";

export function AppSidebar() {
  const router = useRouter();

  /** Actions */
  const [settingsOpen, setSettingsOpen] = useState(false);

  /** Keyboard shortcut */
  const shortcutOptions = { preventDefault: true };
  useHotkeys(
    ["meta+comma", "shift+meta+comma"],
    () => setSettingsOpen(true),
    shortcutOptions,
  );

  return (
    <Sidebar>
      <SidebarClose />
      <SidebarHeader>
        <div className="flex h-11 w-full shrink-0 grow-0 items-center justify-between">
          <WorkspaceSwitcher
            onCreateWorkspace={() => router.push("/onboarding")}
            onWorkspaceChange={({ slug }) =>
              router.push(`/workspace/${encodeURIComponent(slug)}`)
            }
            onSignedOut={() => router.push("/")}
            onOpenSettings={() => setSettingsOpen(true)}
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
            onClick={() => setSettingsOpen(true)}
          />
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
          <SidebarMenuItem
            icon={<Icon.Home className="size-5.5" />}
            label="Home"
            hint="View recent pages and more"
            shortcut="⌘^H"
          />
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <DocList group="document" title="Document" pages={[]} />
      </SidebarContent>
      <SidebarFooter className="mb-10" />
      <SidebarRail />
    </Sidebar>
  );
}
