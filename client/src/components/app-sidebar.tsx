import { LayoutDashboard, Users, BarChart3, Video, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Candidates",
    url: "/candidates",
    icon: Users,
    testId: "link-candidates",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    testId: "link-analytics",
  },
  {
    title: "Interviews",
    url: "/interviews",
    icon: Video,
    testId: "link-interviews",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    testId: "link-settings",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border/50">
      <SidebarHeader className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sidebar-foreground tracking-tight">
              SmartRecruit AI
            </h2>
            <p className="text-xs text-muted-foreground font-medium">AI-Powered Hiring Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.url;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-11 px-3 rounded-lg font-medium transition-all duration-200">
                      <Link href={item.url} data-testid={item.testId}>
                        <Icon className="h-5 w-5" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
