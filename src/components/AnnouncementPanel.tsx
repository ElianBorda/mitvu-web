import { Announcement } from "@/data/types";
import { Megaphone, Plus } from "lucide-react";

interface Props {
  announcements: Announcement[];
  canCreate: boolean;
}

export default function AnnouncementPanel({ announcements, canCreate }: Props) {
  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Anuncios</h3>
        </div>
        {canCreate && (
          <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Plus size={14} /> Nuevo anuncio
          </button>
        )}
      </div>
      <div className="space-y-0">
        {announcements.map((a, i) => (
          <div key={a.id} className={`py-3 ${i < announcements.length - 1 ? "border-b border-border" : ""}`}>
            <h4 className="text-sm font-medium text-foreground">{a.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5">{a.date} · {a.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
