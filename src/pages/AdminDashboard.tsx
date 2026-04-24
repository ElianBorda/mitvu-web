import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  attendanceByCommission,
  getCommissionAvgAttendance,
} from "@/data/mockData";
import DataTable from "@/components/DataTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Comision } from "@/types/comisionType";
import {
  obtenerTodosLosEstudiantesActivos,
  obtenerTodosLosEstudiantesDeBaja,
  asignarEstudianteAComision,
} from "@/service/apiEstudiante";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import { obtenerTodasLasComisiones } from "@/service/apiComision";
import { C } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";
import MetricasGrafico from "@/components/MetricasGrafico";

type AdminView = "comisiones" | "tutores" | "estudiantes";

export default function AdminDashboard() {
  const [view, setView] = useState<AdminView>("comisiones");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [estudiantesActivos, setEstudiantesActivos] = useState<any[]>([]);
  const [estudiantesBaja, setEstudiantesBaja] = useState<any[]>([]);
  const [tutores, setTutores] = useState<any[]>([]);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const comisionIdPorIndice = comisiones?.map((c) => c.id);
  const [clickDelete, setClickDelete] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "estudiantes") {
      setView("estudiantes");
      setSearchParams({}, { replace: true });
    } else if (viewParam === "commissions") {
      setView("comisiones");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchEstudiantes = async () => {
    try {
      const responseActivos = await obtenerTodosLosEstudiantesActivos();
      const responseBaja = await obtenerTodosLosEstudiantesDeBaja();
      setEstudiantesActivos(responseActivos.data);
      setEstudiantesBaja(responseBaja.data);
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
    }
  };

  const fetchTutores = async () => {
    try {
      const response = await obtenerTodosLosTutores();
      setTutores(response.data);
    } catch (error) {
      console.error("Error al obtener tutores:", error);
    }
  };

  const fetchComisiones = async () => {
    try {
      const response = await obtenerTodasLasComisiones();
      setComisiones(response.data);
    } catch (error) {
      console.error("Error al obtener comisiones:", error);
    }
  };

  useEffect(() => {
    fetchComisiones();
    fetchEstudiantes();
    fetchTutores();
  }, [clickDelete, refreshTrigger]);

  const asignarComision = async (estudianteId: number, comisionId: string) => {
    try {
      const response = await asignarEstudianteAComision(
        estudianteId,
        comisionId,
      );
      setEstudiantesActivos((prev) =>
        prev.map((e) =>
          e.id === estudianteId ? { ...e, comision_id: comisionId } : e,
        ),
      );
      triggerRefresh();
    } catch (error) {
      console.error("Error al asignar comisión:", error);
    }
  };

  const totalEstudiantes = estudiantesActivos.length;
  const avgGlobal = Math.round(
    comisiones.reduce((s, c) => s + getCommissionAvgAttendance(c.id), 0) /
      comisiones.length,
  );

  const barData = comisiones.map((c) => ({
    name: "comision",
    asistencia: "No definido",
  }));

  const lineData = Array.from({ length: 6 }, (_, i) => ({
    name: `Enc. ${i + 1}`,
    asistencia: Math.round(
      comisiones.reduce(
        (s, c) => s + (attendanceByCommission[c.id]?.[i]?.percentage || 0),
        0,
      ) / comisiones.length,
    ),
  }));

  const localityData = Object.entries(
    estudiantesActivos.reduce<Record<string, number>>((acc, s) => {
      const comm = comisiones.find((c) => c.id === s.comisionId);
      const loc = comm?.localidad || "Otro";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const PIE_COLORS = [
    "hsl(350,82%,27%)",
    "hsl(350,82%,45%)",
    "hsl(350,82%,60%)",
    "hsl(0,0%,80%)",
  ];

  const comisionData = comisiones.map((c) => {
    const t = tutores.find((tt) => tt.id === (c.tutor?.id || ""));
    return {
      localidad: c.localidad,
      departamento: c.departamento,
      carrera: c.carrera ? c.carrera : "No definida",
      numero: c.numero,
      diaHabil: c.diaHabil,
      horario: `${c.horarioInicio} - ${c.horarioFin}`,
      tutor: t ? `${t.apellido}, ${t.nombre}` : "No definido",
      aula: c.aula ? c.aula : "No definida",
      // asistencia: `${getCommissionAvgAttendance(c.id)}%`,
    };
  });

  const tutorData = tutores.map((t) => ({
    apellido: t.apellido,
    nombre: t.nombre,
    mail: t.mail,
    // horario: t.preferredSchedule,
    // localidad: t.locality,
    comisiones: t.comisiones.length,
  }));

  const estudianteData = estudiantesActivos.map((e) => {
    // const pres = s.attendance.filter(a => a === "present").length;
    // const total = s.attendance.filter(a => a !== "none").length;
    var com: Comision;
    if (e.comision?.id) {
      com = comisiones.find((c) => c.id === e.comision.id);
    }
    return {
      apellido: e.apellido,
      nombre: e.nombre,
      mail: e.mail,
      dni: e.dni,
      carrera: e.carrera,
      comision: (
        <div className="flex items-center gap-2">
          {com ? (
            <span>
              Comisión {com.numero} - {com.departamento} - {com.localidad}
            </span>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90"
                >
                  Asignar +
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-72 p-1 max-h-60 overflow-y-auto"
                align="start"
              >
                {comisiones.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                    No hay comisiones disponibles
                  </div>
                ) : (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Seleccionar comisión
                    </div>

                    {comisiones.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          asignarComision(e.id, c.id);
                        }}
                        className="w-full text-left px-2 py-2 rounded text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Comisión {c.numero} - {c.departamento} - {c.localidad} -{" "}
                        {c.horarioInicio} a {c.horarioFin}
                      </button>
                    ))}
                  </>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
      ),
    };
  });

  const bajasData = estudiantesBaja.map((e) => ({
    apellido: e.apellido,
    nombre: e.nombre,
    motivo: e.baja?.motivo ?? "—",
    detalle: e.baja?.detalle === "" || e.baja?.detalle == null ? "No especificado" : e.baja.detalle,
    fechaBaja: e.baja?.fechaBaja
      ? new Date(e.baja.fechaBaja).toLocaleDateString("es-AR")
      : "—",
  }));

  const tableConfigs: Record<
    AdminView,
    {
      columns: { key: string; label: string }[];
      data: Record<string, any>[];
      addLabel: string;
    }
  > = {
    comisiones: {
      columns: [
        { key: "localidad", label: "Localidad" },
        { key: "departamento", label: "Departamento" },
        { key: "carrera", label: "Carrera" },
        { key: "numero", label: "Numero" },
        { key: "diaHabil", label: "Día hábil" },
        { key: "horario", label: "Horario" },
        { key: "tutor", label: "Tutor/a" },
        { key: "aula", label: "Aula" },
      ],
      data: comisionData,
      addLabel: "Agregar comisión",
    },
    tutores: {
      columns: [
        { key: "apellido", label: "Apellido" },
        { key: "nombre", label: "Nombre" },
        { key: "mail", label: "Mail" },
        { key: "comisiones", label: "Comisiones" },
      ],
      data: tutorData,
      addLabel: "Agregar tutor",
    },
    estudiantes: {
      columns: [
        { key: "apellido", label: "Apellido" },
        { key: "nombre", label: "Nombre" },
        { key: "mail", label: "Mail" },
        { key: "dni", label: "DNI" },
        { key: "carrera", label: "Carrera" },
        { key: "comision", label: "Comisión" },
      ],
      data: estudianteData,
      addLabel: "Agregar estudiante",
    },
  };

  const config = tableConfigs[view];
  const tabs: { id: AdminView; label: string }[] = [
    { id: "comisiones", label: "Comisiones" },
    { id: "tutores", label: "Tutores" },
    { id: "estudiantes", label: "Estudiantes" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left: Table */}
      <div className="flex-1 min-w-0">
        {/* Tab pills */}
        <div className="flex gap-1 mb-4 bg-secondary rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                view === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DataTable
          columns={config.columns}
          data={config.data}
          view={view}
          onAdd={() => {
            if (view === "estudiantes") {
              navigate("/admin/agregar-estudiante");
            }
            if (view === "tutores") {
              navigate("/admin/agregar-tutor");
            }
            if (view === "comisiones") {
              navigate("/admin/agregar-comision");
            }
          }}
          addLabel={config.addLabel}
          onEdit={(row, index) => {
            const id = comisionIdPorIndice[index];
            if (view === "comisiones" && id)
              navigate(`/admin/editar-comision/${id}`);
          }}
          onRowClick={(row, index) => {
            if (view === "comisiones") {
              const id = comisionIdPorIndice[index];
              navigate(`/admin/comision/${id}`);
            }
          }}
          rowIds={comisionIdPorIndice}
          onDelete={(row, index) => {
            const dataCon = [...config.data];
            dataCon.splice(index, 1);
            config.data = dataCon;
            setClickDelete(!clickDelete);
          }}
        />
        {/* Tabla de estudiantes dados de baja */}
        {view === "estudiantes" && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-3">
              Estudiantes dados de baja
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({estudiantesBaja.length})
              </span>
            </h2>
            {bajasData.length === 0 ? (
              <div className="bg-card border border-border rounded-lg px-6 py-8 text-center text-sm text-muted-foreground">
                No hay estudiantes dados de baja.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2d2d2d] text-white">
                      <th className="px-4 py-3 text-left font-medium">
                        Apellido
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Motivo
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Detalle
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Fecha de baja
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bajasData.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-t border-border ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}
                      >
                        <td className="px-4 py-3 text-foreground">
                          {row.apellido}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {row.nombre}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.motivo}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                          {row.detalle}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.fechaBaja}
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

      {/* Right: Metrics */}
      <div className="w-full xl:w-80 shrink-0 space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Métricas generales
        </h2>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-lg shadow-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {totalEstudiantes}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Total estudiantes
            </p>
          </div>
          <div className="bg-card rounded-lg shadow-card border border-border p-4 text-center">
            <p
              className={`text-2xl font-bold ${avgGlobal >= 70 ? "text-green-600" : "text-destructive"}`}
            >
              {avgGlobal}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Asistencia promedio
            </p>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Estudiantes totales dados de baja.
          </h3>
          <MetricasGrafico />
        </div>

        {/* Bar chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Asistencia por comisión
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar
                dataKey="asistencia"
                fill="hsl(350,82%,27%)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Evolución global
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="asistencia"
                stroke="hsl(350,82%,27%)"
                strokeWidth={2}
                dot={{ fill: "hsl(350,82%,27%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
