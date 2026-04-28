import { useEffect, useState } from "react";
import { Role } from "@/data/types";
import { announcements } from "@/data/mockData";
import {
  Building,
  MapPin,
  GraduationCap,
  Building2,
  Hash,
  Clock,
  User,
  Mail,
  Calendar1Icon,
} from "lucide-react";
import AnnouncementPanel from "./AnnouncementPanel";
import MetricsPanel from "./MetricsPanel";
import { Comision } from "@/types/comisionType";
import {
  obtenerEstudiantesDeComision,
  obtenerEstudiantesDadosDeBajaDeUnaComision,
} from "@/service/apiEstudiante";
import { obtenerTutorDeLaComision } from "@/service/apiTutor";
import { Tutor } from "@/types/tutorType";
import { isAxiosError } from "axios";
import MetricasLargoComision from "./MetricasLargoComision";
import PanelCalendario from "./PanelCalendario";

interface Props {
  comision: Comision;
  role: Role;
  onBack?: () => void;
}

export default function ComisionDetalle({ comision, role, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<"participants" | "metrics">(
    "participants",
  );
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [estudiantesBaja, setEstudiantesBaja] = useState<any[]>([]);
  const [tutor, setTutor] = useState<Tutor>(null);
  const commAnnouncements = announcements.filter(
    (a) => a.commissionId === comision.id,
  );
  const showMetricsTab = role === "tutor" || role === "admin";

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await obtenerTutorDeLaComision(comision.id);
        setTutor(response.data);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400) {
        } else {
          console.error("Error fetching comision:", error);
        }
      }
    };

    const fetchEstudiantes = async () => {
      try {
        const response = await obtenerEstudiantesDeComision(comision.id);
        setEstudiantes(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    const fetchEstudiantesBaja = async () => {
      try {
        const response = await obtenerEstudiantesDadosDeBajaDeUnaComision(
          comision.id,
        );
        setEstudiantesBaja(response.data);
      } catch (error) {
        console.error("Error fetching students on leave:", error);
      }
    };

    fetchTutor();
    fetchEstudiantes();
    if (role === "tutor" || role === "admin") {
      fetchEstudiantesBaja();
    }
  }, [comision.id]);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-primary hover:underline"
            >
              ← Volver
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Comision {comision.numero} — {comision.localidad} - Dep.{" "}
            {comision.departamento}{" "}
            {comision.carrera ? `- ${comision.carrera}` : ""}
          </h1>
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
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Datos de la comisión
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {comision.aula ? (
                  <InfoRow icon={Building} label="Aula" value={comision.aula} />
                ) : (
                  <InfoRow
                    icon={Building}
                    label="Aula"
                    value="No especificada"
                  />
                )}
                <InfoRow
                  icon={MapPin}
                  label="Localidad"
                  value={comision.localidad}
                />
                {comision.carrera ? (
                  <InfoRow
                    icon={GraduationCap}
                    label="Carrera"
                    value={comision.carrera}
                  />
                ) : (
                  <InfoRow
                    icon={GraduationCap}
                    label="Carrera"
                    value="No especificada"
                  />
                )}
                <InfoRow
                  icon={Building2}
                  label="Departamento"
                  value={comision.departamento}
                />
                <InfoRow
                  icon={Hash}
                  label="Nº Comisión"
                  value={String(comision.numero)}
                />
                <InfoRow
                  icon={Clock}
                  label="Horario"
                  value={`${comision.horarioInicio} a ${comision.horarioFin}`}
                />
                <InfoRow
                  icon={Calendar1Icon}
                  label="Día hábil"
                  value={comision.diaHabil}
                />
                <InfoRow icon={Clock} label="Turno" value={comision.turno} />
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-6 mt-4">
                {tutor ? (
                  <div className="flex items-center gap-6">
                    <InfoRow
                      icon={User}
                      label="Tutor/a"
                      value={`${tutor.nombre} ${tutor.apellido}`}
                    />
                    <InfoRow icon={Mail} label="Mail" value={tutor.mail} />
                  </div>
                ) : (
                  <span className="font-semibold text-muted-foreground">
                    No hay tutor asignado a esta comisión.
                  </span>
                )}
              </div>
            </div>

            {/* Participants table */}
            <div className="bg-card rounded-lg shadow-card border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-4 py-2.5 text-left font-medium">Nº</th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Apellido
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Nombre
                    </th>
                    {role === "tutor" || role === "admin" ? (
                      <th className="px-4 py-2.5 text-left font-medium">DNI</th>
                    ) : null}
                    <th className="px-4 py-2.5 text-left font-medium">
                      Carrera
                    </th>
                    {role === "tutor" || role === "admin" ? (
                      <th className="px-4 py-2.5 text-left font-medium">
                        Asistencia
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.length === 0 ? (
                    <tr className="bg-card">
                      <td
                        colSpan={role === "tutor" || role === "admin" ? 5 : 4}
                        className="px-4 py-2.5 text-center text-muted-foreground"
                      >
                        No hay estudiantes en esta comisión.
                      </td>
                    </tr>
                  ) : (
                    estudiantes.map((e, i) => {
                      const presentCount = 0; // s.attendance.filter(a => a === "present").length;
                      const totalCount = 0; // s.attendance.filter(a => a !== "none").length;
                      const pct =
                        totalCount > 0
                          ? Math.round((presentCount / totalCount) * 100)
                          : 0;
                      return (
                        <tr
                          key={e.id}
                          className={
                            i % 2 === 0 ? "bg-card" : "bg-[hsl(350,50%,98%)]"
                          }
                        >
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-foreground">
                            {e.apellido}
                          </td>
                          <td className="px-4 py-2.5 text-foreground">
                            {e.nombre}
                          </td>
                          {role === "tutor" || role === "admin" ? (
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {e.dni}
                            </td>
                          ) : null}
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {e.carrera}
                          </td>
                          {role === "tutor" || role === "admin" ? (
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  pct >= 75
                                    ? "bg-green-100 text-green-700"
                                    : pct >= 50
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {pct}%
                              </span>
                            </td>
                          ) : null}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Tabla de estudiantes dados de baja — solo tutor/admin */}
            {(role === "tutor" || role === "admin") && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Estudiantes dados de baja
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({estudiantesBaja.length})
                  </span>
                </h3>
                {estudiantesBaja.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg px-6 py-6 text-center text-sm text-muted-foreground">
                    No hay estudiantes dados de baja en esta comisión.
                  </div>
                ) : (
                  <div className="bg-card rounded-lg shadow-card border border-border overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-[#2d2d2d] text-white">
                          <th className="px-4 py-2.5 text-left font-medium">
                            Apellido
                          </th>
                          <th className="px-4 py-2.5 text-left font-medium">
                            Nombre
                          </th>
                          <th className="px-4 py-2.5 text-left font-medium">
                            Motivo
                          </th>
                          <th className="px-4 py-2.5 text-left font-medium">
                            Detalle
                          </th>
                          <th className="px-4 py-2.5 text-left font-medium">
                            Fecha de baja
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantesBaja.map((e, i) => (
                          <tr
                            key={e.id}
                            className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-[#fafafa]"}`}
                          >
                            <td className="px-4 py-2.5 font-medium text-foreground">
                              {e.apellido}
                            </td>
                            <td className="px-4 py-2.5 text-foreground">
                              {e.nombre}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {e.baja?.motivo ?? "—"}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground max-w-xs truncate">
                              {e.baja?.detalle === "" || e.baja?.detalle == null
                                ? "No especificado"
                                : e.baja.detalle}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {e.baja?.fechaBaja
                                ? new Date(e.baja.fechaBaja).toLocaleDateString(
                                    "es-AR",
                                  )
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Announcements */}
          <div className="w-full lg:w-80 shrink-0 gap-4 flex flex-col">
            <PanelCalendario eventos={[]} onAgregarEvento={() => {}} />
            <AnnouncementPanel
              announcements={commAnnouncements}
              canCreate={role === "tutor" || role === "admin"}
            />
          </div>
        </div>
      ) : (
        <MetricasLargoComision
          comisionId={comision.id}
          numeroComision={comision.numero}
        />
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-primary shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground truncate">{value}</span>
    </div>
  );
}
