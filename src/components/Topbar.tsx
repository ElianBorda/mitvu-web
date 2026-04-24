import { useState } from "react";
import { Search, Bell } from "lucide-react";
import { Role } from "@/data/types";
import NotificationDropdown from "./NotificationDropdown";

interface TopbarProps {
  userName: string;
  role: Role;
  onRoleChange: (role: Role) => void;
}

export default function Topbar({ userName, role, onRoleChange }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const unreadCount = 2;

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-2xl relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Role switcher */}
      <select
        value={role}
        onChange={e => onRoleChange(e.target.value as Role)}
        className="h-9 px-3 rounded-lg bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        <option value="student">Estudiante</option>
        <option value="tutor">Tutor</option>
        <option value="admin">Admin</option>
      </select>

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
