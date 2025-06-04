import {
  Sidebar,
  SidebarClose,
  SidebarHeader,
  SidebarInset,
  SidebarOpen,
  SidebarProvider,
  SidebarRail,
} from "@notion-kit/sidebar";

export function AppSidebar() {
  return (
    <SidebarProvider className="h-full min-h-full">
      <Sidebar className="absolute z-0 h-full">
        <SidebarClose />
        <SidebarHeader className="p-3 font-semibold">My App</SidebarHeader>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
          <SidebarOpen />
          Navbar
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
