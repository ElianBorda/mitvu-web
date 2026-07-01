import { useState } from "react";
import { 
  Home, Users, GraduationCap, Calendar, Settings, LayoutList, 
  Megaphone, LogOut, Link as LinkIcon, ChevronLeft, ChevronRight, X, 
  BarChart2, MessageSquare, FileCheck, UserX
} from "lucide-react";
import { Role } from "@/data/types";
import logo from "@/assets/mi-tvu-logo.png";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: string;
  danger?: boolean;
}

const sidebarItems: Record<Role, SidebarItem[]> = {
  estudiante: [
    { icon: Home, label: "Inicio", id: "home" },
    { icon: LinkIcon, label: "Redes UNQ", id: "redes" },
    { icon: Megaphone, label: "Anuncios globales", id: "anuncios" },
    { icon: Settings, label: "Configuración", id: "configuracion" },
    { icon: UserX, label: "Darse de baja", id: "baja", danger: true }, // Cambiado a UserX
  ],
  tutor: [
    { icon: LayoutList, label: "Comisiones", id: "comisiones" },
    { icon: Megaphone, label: "Anuncios globales", id: "anuncios" },
    { icon: Settings, label: "Configuración", id: "configuracion" },
  ],
  admin: [
    { icon: LayoutList, label: "Comisiones", id: "comisiones" },
    { icon: Users, label: "Tutores", id: "tutores" },
    { icon: GraduationCap, label: "Estudiantes", id: "estudiantes" },
    { icon: BarChart2, label: "Métricas", id: "metricas" },
    { icon: MessageSquare, label: "Feedback", id: "feedback" },
    { icon: FileCheck, label: "Solicitudes", id: "solicitudes" },
    { icon: Megaphone, label: "Anuncios globales", id: "anuncios" },
    { icon: Settings, label: "Configuración", id: "configuracion" },
  ],
};

interface AppSidebarProps {
  role: Role;
  activeItem: string;
  onItemClick: (id: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  hideStudentUnenroll?: boolean; 
  onLogout: () => void; // NUEVA PROP
}

export default function AppSidebar({ role, activeItem, onItemClick, mobileOpen, onMobileClose, hideStudentUnenroll, onLogout }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const items = sidebarItems[role].filter(i => !(hideStudentUnenroll && role === "estudiante" && i.id === "baja"));
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
        <button onClick={onMobileClose} className="md:hidden p-1 rounded hover:bg-white/10">
          <X size={20} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col py-4 gap-1 px-2 overflow-y-auto">
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

      {/* Danger items and Logout at bottom */}
      <div className="px-2 pb-2 mt-auto flex flex-col gap-1 border-t border-white/10 pt-2">
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
        
        {/* Botón estático de Cerrar Sesión */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-red-500/20 w-full"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut size={20} className="shrink-0 text-red-400" />
          {!collapsed && <span className="text-red-400">Cerrar sesión</span>}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center h-12 border-t border-white/10 hover:bg-white/10 transition-colors shrink-0"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </>
  );

  return (
    <>
      <aside className={`hidden md:flex fixed top-0 left-0 h-screen z-40 flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
        {sidebarContent}
      </aside>
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`} />
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onMobileClose} />
      )}
      <aside className={`md:hidden fixed top-0 left-0 h-screen z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>
    </>
  );
}