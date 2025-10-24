import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-14 border-b border-border bg-card flex items-center px-4">
            <SidebarTrigger />
          </header>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
