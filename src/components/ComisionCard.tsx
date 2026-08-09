import {
  getCommissionAvgAttendance,
  getStudentsForCommission,
  getTutorForCommission,
} from "@/data/mockData";
import { MapPin, Clock, Users, Building, Calendar1Icon } from "lucide-react";
import { Comision } from "@/types/comisionType";
import { Estudiante } from "@/types/estudianteType";

interface Props {
  comision: Comision;
  onClick: () => void;
}

export default function ComisionCard({ comision, onClick }: Props) {
  const estudiantesComision = (comision.estudiantes as any[]) || [];
  const avg = 
    estudiantesComision.length > 0
      ? Math.round(
          (estudiantesComision.reduce((total, estudiante) => {
            const asistenciasPresentes = (estudiante.asistencias || []).filter(
              (a: any) =>
                a.tipoDeAsistencia === "PRESENTE" ||
                a.tipoDeAsistencia === "AUSENCIA_JUSTIFICADA",
            ).length;
            const totalAsistencias = (estudiante.asistencias || []).length;
            return (
              total +
              (totalAsistencias > 0
                ? asistenciasPresentes / totalAsistencias
                : 0)
            );
          }, 0) /
            estudiantesComision.length) *
            100,
        )
      : 0;
  const cantEstudiantes = estudiantesComision.length;
  const aula = comision.aula;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-lg shadow-card p-5 hover:shadow-md transition-shadow border border-border group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            Comision {comision.numero} — {comision.localidad} -{" "}
            {comision.departamento}{" "}
            {comision.carrera ? `- ${comision.carrera}` : ""}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {aula ? (
              <span className="flex items-center gap-1">
                <Building size={12}/>{aula}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Building size={12}/> Aula aún no definida
              </span>
            )}
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
          <Users size={12} />
          {cantEstudiantes}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {comision.localidad}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} /> {comision.horarioInicio} a {comision.horarioFin}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Asistencia promedio</span>
          <span className="font-semibold text-foreground">{avg}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              avg > 75 ? "bg-green-500" : avg > 50 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${avg}%` }}
          />
        </div>
      </div>
    </button>
  );
}
