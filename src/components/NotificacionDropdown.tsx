import { useEffect, useRef, useState } from "react";
import { Notificacion } from "@/types/notificacionType";

interface Props {
  onClose: () => void;
  notificaciones: Notificacion[]; 
}

export default function NotificacionDropdown({ onClose, notificaciones }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-12 w-80 bg-card rounded-lg shadow-card border border-border z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {
          notificaciones.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground">No tienes notificaciones.</p>
            </div>
          ) : (
            notificaciones.map(n => (
              <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                <p className="text-sm font-medium text-foreground">{n.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.descripcion}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.fecha}</p>
              </div>
            ))
          )
        }
      </div>
    </div>
  );
}
