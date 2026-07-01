import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Role } from "@/data/types";
import NotificacionDropdown from "./NotificacionDropdown";
import { Notificacion } from "@/types/notificacionType";

interface TopbarProps {
  userName: string;
  role: Role;
  onMenuClick: () => void;
  notificaciones: Notificacion[];
}

export default function Topbar({ userName, role, onMenuClick, notificaciones }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Calcula iniciales seguras (por si el userName llega vacío por un microsegundo)
  const initials = userName ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  const unreadCount = notificaciones.filter(n => !n.read).length;

  const currentLabel = role === "admin" ? "Administrador" : role === "tutor" ? "Tutor" : "Estudiante";

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-3 sm:px-6 gap-2 sm:gap-4 sticky top-0 z-30">
      <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
        <Menu size={20} className="text-foreground" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-2xl relative hidden sm:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Etiqueta de Rol actual (Badge visual) */}
      <div className="hidden sm:flex items-center">
        <span className="px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-muted-foreground tracking-wide uppercase">
          {currentLabel}
        </span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Bell size={20} className="text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <NotificacionDropdown 
             onClose={() => setShowNotifications(false)} 
             notificaciones={notificaciones} 
          />
        )}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <span className="text-sm font-medium text-foreground hidden lg:block">{userName}</span>
      </div>
    </header>
  );
}