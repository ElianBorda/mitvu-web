import { useState } from "react";
import { Commission, Role } from "@/data/types";
import { getStudentsForCommission, getTutorForCommission, announcements } from "@/data/mockData";
import { Building, MapPin, GraduationCap, Building2, Hash, Clock, Sun, User, Mail } from "lucide-react";
import AnnouncementPanel from "./AnnouncementPanel";
import MetricsPanel from "./MetricsPanel";

interface Props {
  commission: Commission;
  role: Role;
  onBack?: () => void;
}

export default function CommissionDetail({ commission, role, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<"participants" | "metrics">("participants");
  const students = getStudentsForCommission(commission.id);
  const tutor = getTutorForCommission(commission.id);
  const commAnnouncements = announcements.filter(a => a.commissionId === commission.id);
  const showMetricsTab = role === "tutor" || role === "admin";

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-sm text-primary hover:underline">← Volver</button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{commission.name}</h1>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("participants")}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === "participants" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Participantes
          </button>
          {showMetricsTab && (
            <button
              onClick={() => setActiveTab("metrics")}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === "metrics" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Métricas
            </button>
          )}
        </div>
      </div>

      {activeTab === "participants" ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left section */}
          <div className="flex-1 min-w-0">
            {/* Commission data */}
            <div className="bg-card rounded-lg shadow-card p-5 mb-6 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">Datos de la comisión</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoRow icon={Building} label="Aula" value={commission.classroom} />
                <InfoRow icon={MapPin} label="Localidad" value={commission.locality} />
                {commission.career && <InfoRow icon={GraduationCap} label="Carrera" value={commission.career} />}
                <InfoRow icon={Building2} label="Departamento" value={commission.department} />
                <InfoRow icon={Hash} label="Nº Comisión" value={String(commission.number)} />
                <InfoRow icon={Clock} label="Horario" value={commission.schedule} />
                <InfoRow icon={Sun} label="Turno" value={commission.shift} />
                {tutor && <InfoRow icon={User} label="Tutor/a" value={`${tutor.firstName} ${tutor.lastName}`} />}
                {tutor && <InfoRow icon={Mail} label="Mail tutor/a" value={tutor.email} />}
              </div>
            </div>

            {/* Participants table */}
            <div className="bg-card rounded-lg shadow-card border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-4 py-2.5 text-left font-medium">Nº</th>
                    <th className="px-4 py-2.5 text-left font-medium">Apellido</th>
                    <th className="px-4 py-2.5 text-left font-medium">Nombre</th>
                    <th className="px-4 py-2.5 text-left font-medium">DNI</th>
                    <th className="px-4 py-2.5 text-left font-medium">Carrera</th>
                    <th className="px-4 py-2.5 text-left font-medium">Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const presentCount = s.attendance.filter(a => a === "present").length;
                    const totalCount = s.attendance.filter(a => a !== "none").length;
                    const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                    return (
                      <tr key={s.id} className={i % 2 === 0 ? "bg-card" : "bg-[hsl(350,50%,98%)]"}>
                        <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{s.lastName}</td>
                        <td className="px-4 py-2.5 text-foreground">{s.firstName}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{s.dni}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{s.career}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            pct >= 75 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                          }`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Announcements */}
          <div className="w-full lg:w-80 shrink-0">
            <AnnouncementPanel announcements={commAnnouncements} canCreate={role === "tutor" || role === "admin"} />
          </div>
        </div>
      ) : (
        <MetricsPanel commissionId={commission.id} commissionNumber={commission.number} />
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-primary shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground truncate">{value}</span>
    </div>
  );
}
