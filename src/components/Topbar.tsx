import { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, ChevronDown } from "lucide-react";
import { Role } from "@/data/types";
import NotificationDropdown from "./NotificationDropdown";
import { Tutor } from "@/types/tutorType";
import { Estudiante } from "@/types/estudianteType";

interface TopbarProps {
  userName: string;
  role: Role;
  onRoleChange: (role: Role) => void;
  onMenuClick: () => void;
  tutores: any[];
  onTutorSelect: (id: number) => void;
  estudiantes: any[];
  onEstudianteSelect: (id: number) => void;
}

const STATIC_OPTIONS = [
  { label: "Admin",      value: "admin"   as Role },
];

export default function Topbar({ userName, role, onRoleChange, onMenuClick, tutores, onTutorSelect, estudiantes, onEstudianteSelect }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const unreadCount = 2;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Texto que muestra el botón según la selección actual
  const currentLabel = role === "estudiante" ? "Estudiante" : role === "admin" ? "Admin" : "Tutor";

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

      <div className="flex-1 sm:hidden" />

      {/* Role switcher — dropdown custom */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowRoleMenu(prev => !prev)}
          className="h-9 px-2 sm:px-3 rounded-lg bg-secondary text-xs sm:text-sm text-foreground flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <span>{currentLabel}</span>
          <ChevronDown size={14} className={`transition-transform ${showRoleMenu ? "rotate-180" : ""}`} />
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 mt-1 w-48 rounded-lg bg-card border border-border shadow-lg py-1 z-50">
            {/* Opciones estáticas */}
            {STATIC_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onRoleChange(opt.value); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors
                  ${role === opt.value ? "text-primary font-medium" : "text-foreground"}`}
              >
                {opt.label}
              </button>
            ))}

            {/* Separador si hay tutores */}
            {tutores.length > 0 && (
              <div className="my-1 border-t border-border" />
            )}

            {/* Tutores dinámicos */}
            {tutores.map(tutor => (
              <button
                key={tutor.id}
                onClick={() => { onTutorSelect(tutor.id); setShowRoleMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
              >
                <span>{tutor.nombre}</span>
                <span className="text-muted-foreground text-xs">- Tutor</span>
              </button>
            ))}

            {/* Estudiantes dinámicos */}
            {estudiantes.length > 0 && (
              <div className="my-1 border-t border-border" />
            )}
            {estudiantes.map(estudiante => (
              <button
                key={estudiante.id}
                onClick={() => { onEstudianteSelect(estudiante.id); setShowRoleMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
                >
                  <span>{estudiante.nombre}</span>
                  <span className="text-muted-foreground text-xs">- Estudiante</span>
                </button>
              ))}

          </div>
        )}
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
          <NotificationDropdown onClose={() => setShowNotifications(false)} />
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