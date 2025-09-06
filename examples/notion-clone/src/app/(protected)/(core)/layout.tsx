import {
  SidebarInset,
  SidebarOpen,
  SidebarProvider,
} from "@notion-kit/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default function CoreLayout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
          <SidebarOpen />
          Navbar
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
