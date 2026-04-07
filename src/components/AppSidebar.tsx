import { useState } from "react";
import { Home, Users, GraduationCap, Calendar, Settings, LayoutList, Megaphone, LogOut, Link as LinkIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Role } from "@/data/types";
import logo from "@/assets/mi-tvu-logo.png";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: string;
  danger?: boolean;
}

const sidebarItems: Record<Role, SidebarItem[]> = {
  student: [
    { icon: Home, label: "Inicio", id: "home" },
    { icon: Calendar, label: "Calendario", id: "calendar" },
    { icon: LinkIcon, label: "Redes UNQ", id: "redes" },
    { icon: Settings, label: "Configuración", id: "settings" },
    { icon: LogOut, label: "Darse de baja", id: "baja", danger: true },
  ],
  tutor: [
    { icon: Home, label: "Inicio", id: "home" },
    { icon: Users, label: "Comisiones", id: "commissions" },
    { icon: GraduationCap, label: "Estudiantes", id: "students" },
    { icon: Calendar, label: "Calendario", id: "calendar" },
    { icon: Settings, label: "Configuración", id: "settings" },
  ],
  admin: [
    { icon: Home, label: "Inicio", id: "home" },
    { icon: LayoutList, label: "Comisiones", id: "commissions" },
    { icon: Users, label: "Tutores", id: "tutors" },
    { icon: GraduationCap, label: "Estudiantes", id: "students" },
    { icon: Megaphone, label: "Anuncios globales", id: "announcements" },
    { icon: Settings, label: "Configuración", id: "settings" },
  ],
};

interface AppSidebarProps {
  role: Role;
  activeItem: string;
  onItemClick: (id: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AppSidebar({ role, activeItem, onItemClick, mobileOpen, onMobileClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const items = sidebarItems[role];
  const mainItems = items.filter(i => !i.danger);
  const dangerItems = items.filter(i => i.danger);

  const handleClick = (id: string) => {
    onItemClick(id);
    onMobileClose();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-3 border-b border-white/10">
        {collapsed ? (
          <span className="text-lg font-bold tracking-tight mx-auto">m</span>
        ) : (
          <img src={logo} alt="miTVU" className="h-8 brightness-0 invert" />
        )}
        {/* Mobile close button */}
        <button onClick={onMobileClose} className="md:hidden p-1 rounded hover:bg-white/10">
          <X size={20} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col py-4 gap-1 px-2">
        {mainItems.map(item => {
          const active = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group relative
                ${active ? "bg-sidebar-active" : "hover:bg-white/10"}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r" />}
            </button>
          );
        })}
      </nav>

      {/* Danger items at bottom */}
      {dangerItems.length > 0 && (
        <div className="px-2 pb-2">
          {dangerItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-white/50 hover:text-white/80 hover:bg-white/5 w-full"
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center h-12 border-t border-white/10 hover:bg-white/10 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-screen z-40 flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop spacer */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
