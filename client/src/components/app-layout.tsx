import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { AppHeader } from "./app-header";

export const AppLayout = () => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" collapsible="icon" />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
