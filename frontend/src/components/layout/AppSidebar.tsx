import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Search, FileText, Link2, Brain, TrendingUp, Shield, MessageSquare, Bell, User, Settings, ChevronLeft, ChevronRight, Boxes, Landmark, ShieldCheck, Crown
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Opportunities", path: "/opportunities", icon: Search },
  { title: "My Applications", path: "/applications", icon: FileText },
  { title: "Gov Tenders", path: "/government-tenders", icon: Landmark },
  { title: "Gov Contracts", path: "/government-contracts", icon: ShieldCheck },
  { title: "Supply Chain", path: "/supply-chain", icon: Boxes },
  { title: "Collaborations", path: "/collaborations", icon: Link2 },
  { title: "AI Recommendations", path: "/ai-recommendations", icon: Brain },
  { title: "Growth Analytics", path: "/company-growth", icon: TrendingUp },
  { title: "Mediation", path: "/mediation", icon: ShieldCheck },
];

const bottomItems = [
  { title: "Messages", path: "/messages", icon: MessageSquare, badge: 3 },
  { title: "Notifications", path: "/notifications", icon: Bell, badge: 7 },
  { title: "Subscriptions", path: "/subscriptions", icon: Crown },
  { title: "Profile", path: "/profile", icon: User },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`${collapsed ? "w-[68px]" : "w-[260px]"} 
        min-h-screen sidebar-gradient border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-40`}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-sidebar-primary-foreground">U</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight animate-fade-in">
              UNIFY
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted px-3 mb-2">
            Platform
          </p>
        )}
        {navItems.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
            >
              <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="py-3 px-2 space-y-1 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted px-3 mb-2">
            Account
          </p>
        )}
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {"badge" in item && item.badge && !collapsed && (
                <span className="ml-auto text-[11px] font-semibold gradient-primary text-primary-foreground px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="px-2 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-sm"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
