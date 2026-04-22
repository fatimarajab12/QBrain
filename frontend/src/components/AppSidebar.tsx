import { User, FolderKanban, LogOut, Settings, Shield } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "@/components/Logo";
import { authStorage } from "@/utils/auth-helpers";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authStorage.getUser();

  const navItems = [
    { title: "Projects", url: "/dashboard", icon: FolderKanban },
    ...(user?.role === "admin" ? [{ title: "Admin", url: "/admin", icon: Shield }] : []),
  ];

  const handleLogout = () => {
    authStorage.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-sidebar/95 backdrop-blur-sm shadow-lg">
      <SidebarContent className="flex flex-col">
        <div className="p-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
          <Logo size={40} showText={open} textSize="sm" />
        </div>

        <SidebarGroup className="flex-1 mt-4 px-2">
          <SidebarGroupLabel className="px-3 mb-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {open ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 scale-[1.02]"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:shadow-sm hover:scale-[1.01]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${open ? "" : "group-hover:scale-110"}`} />
                          {open && (
                            <span className="font-semibold text-base tracking-wide">
                              {item.title}
                            </span>
                          )}
                          {isActive && open && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="border-t border-border/60 pt-3 px-2 pb-3 bg-gradient-to-t from-primary/5 to-transparent">
          <SidebarMenu>
            <SidebarMenuItem>
              {open ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full justify-start gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 hover:shadow-md transition-all duration-300 group">
                      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm shadow-md">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start flex-1 min-w-0 overflow-hidden gap-0.5">
                        <span 
                          className="font-semibold text-sm text-foreground truncate w-full leading-tight" 
                          title={user?.name || "User"}
                        >
                          {user?.name || "User"}
                        </span>
                        <span 
                          className="text-xs text-muted-foreground truncate w-full leading-tight" 
                          title={user?.email || ""}
                        >
                          {user?.email || ""}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 shadow-xl border-border/60">
                    <DropdownMenuLabel className="px-3 py-2.5 font-semibold">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer px-3 py-2.5 gap-3 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/settings")}
                      className="cursor-pointer px-3 py-2.5 gap-3 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer px-3 py-2.5 gap-3 text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full justify-center hover:bg-primary/10 hover:shadow-md transition-all duration-300 group">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm shadow-md">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-64 shadow-xl border-border/60">
                    <DropdownMenuLabel className="px-3 py-2.5 font-semibold">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer px-3 py-2.5 gap-3 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/settings")}
                      className="cursor-pointer px-3 py-2.5 gap-3 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer px-3 py-2.5 gap-3 text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
