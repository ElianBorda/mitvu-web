/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCommissionAvgAttendance } from "@/data/mockData";
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
import { obtenerTodosLosEventos } from "@/service/apiEvento";
import { obtenerMetricasDeAsistenciaGlobal } from "@/service/apiMetrica";
import MetricasGrafico from "@/components/MetricasGrafico";
import PanelCalendario from "@/components/PanelCalendario";
import { toast } from "sonner";
import { Evento } from "@/types/eventoType";
import { useLayoutContext } from "@/App";
import PanelAnuncios from "@/components/PanelAnuncios";
import { Anuncio } from "@/types/anuncioType";
import { obtenerAnunciosGlobales } from "@/service/apiAnuncio";
import { useExportarTabla } from "@/hooks/useExportarTabla";
import BotonExportar from "@/components/BotonExportar";
import CargaMasivaEstudiantes from "@/components/CargaMasivaEstudiantes";

type AdminView = "comisiones" | "tutores" | "estudiantes";

export default function AdminDashboard() {
  const [view, setView] = useState<AdminView>("comisiones");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { adminActualId } = useLayoutContext();
  const [estudiantesActivos, setEstudiantesActivos] = useState<any[]>([]);
  const [estudiantesBaja, setEstudiantesBaja] = useState<any[]>([]);
  const [tutores, setTutores] = useState<any[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [lineData, setLineData] = useState<
    { name: string; asistencia: number; tituloOriginal: string }[]
  >([]);
  const [cargaMasivaOpen, setCargaMasivaOpen] = useState(false);

  const columnasExport = useMemo(() => {
    if (view == "tutores")
      return [
        { key: "apellido", label: "Apellido" },
        { key: "nombre", label: "Nombre" },
        { key: "mail", label: "Mail" },
        { key: "comisiones", label: "Comisiones" },
      ];
    else if (view == "comisiones")
      return [
        { key: "localidad", label: "Localidad" },
        { key: "departamento", label: "Departamento" },
        { key: "carrera", label: "Carrera" },
        { key: "numero", label: "Numero" },
        { key: "horario", label: "Horario" },
        { key: "tutor", label: "Tutor/a" },
        { key: "aula", label: "Aula" },
      ];
    return [
      { key: "apellido", label: "Apellido" },
      { key: "nombre", label: "Nombre" },
      { key: "mail", label: "Mail" },
      { key: "dni", label: "DNI" },
      { key: "carrera", label: "Carrera" },
      { key: "comision", label: "Comisión" },
    ];
  }, [view]);

  const filasExport = useMemo(() => {
    if (view == "tutores")
      return tutores.map((t) => ({
        apellido: t.apellido,
        nombre: t.nombre,
        mail: t.mail,
        comisiones: t.comisiones?.length || 0,
      }));
    else if (view == "comisiones")
      return comisiones.map((c) => {
        const t = tutores.find((tt) => tt.id === (c.tutor?.id || ""));
        return {
          localidad: c.localidad,
          departamento: c.departamento,
          carrera: c.carrera ? c.carrera : "Sin carrera definida",
          numero: c.numero,
          horario: c.horarioInicio + " - " + c.horarioFin,
          tutor: t ? `${t.nombre} ${t.apellido}` : "Sin tutor asignado",
          aula: c.aula || "Sin aula asignada",
        };
      });
    return estudiantesActivos.map((e) => ({
      apellido: e.apellido,
      nombre: e.nombre,
      mail: e.mail,
      dni: e.dni,
      carrera: e.carrera ? e.carrera : "Sin carrera definida",
      comision: e.comision
        ? `Comisión ${e.comision.numero} - ${e.comision.departamento} - ${e.comision.localidad}`
        : "Sin comisión asignada",
    }));
  }, [view, estudiantesActivos]);

  const { exportarCSV, exportarExcel, exportarPDF } = useExportarTabla(
    columnasExport,
    filasExport,
    view,
    null,
  );

  const columnasExportBajas = useMemo(
    () => [
      { key: "apellido", label: "Apellido" },
      { key: "nombre", label: "Nombre" },
      { key: "mail", label: "Mail" },
      { key: "motivo", label: "Motivo" },
      { key: "detalle", label: "Detalle" },
      { key: "fechaBaja", label: "Fecha de baja" },
    ],
    [],
  );

  const filasExportBajas = useMemo(
    () =>
      estudiantesBaja.map((e) => ({
        apellido: e.apellido,
        nombre: e.nombre,
        motivo: e.baja?.motivo ?? "—",
        detalle:
          e.baja?.detalle === "" || e.baja?.detalle == null
            ? "No especificado"
            : e.baja.detalle,
        fechaBaja: e.baja?.fechaBaja
          ? new Date(e.baja.fechaBaja).toLocaleDateString("es-AR")
          : "—",
      })),
    [estudiantesBaja],
  );

  const {
    exportarCSV: exportarCSVBajas,
    exportarExcel: exportarExcelBajas,
    exportarPDF: exportarPDFBajas,
  } = useExportarTabla(
    columnasExportBajas,
    filasExportBajas,
    "estudiantes-baja",
    null,
  );

  const comisionIdPorIndice = comisiones?.map((c) => c.id);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const rowIds = (() => {
    if (view === "comisiones") return comisiones.map((c) => c.id);
    if (view === "tutores") return tutores.map((t) => t.id);
    if (view === "estudiantes") return estudiantesActivos.map((e) => e.id);
    return [];
  })();
  const { refreshPeople } = useLayoutContext();

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const { registerSidebarHandler, unregisterSidebarHandler, setActiveItem } =
    useLayoutContext();

  useEffect(() => {
    registerSidebarHandler("comisiones", () => setView("comisiones"));
    registerSidebarHandler("estudiantes", () => setView("estudiantes"));
    registerSidebarHandler("tutores", () => setView("tutores"));

    return () => {
      unregisterSidebarHandler("comisiones");
      unregisterSidebarHandler("estudiantes");
      unregisterSidebarHandler("tutores");
    };
  }, []);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "estudiantes") {
      setView("estudiantes");
      setSearchParams({}, { replace: true });
    } else if (viewParam === "comisiones") {
      setView("comisiones");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    obtenerTodosLosEstudiantesActivos()
      .then(({ data }) => setEstudiantesActivos(data))
      .catch(() => toast.error("Error al obtener estudiantes activos"));

    obtenerTodosLosEstudiantesDeBaja()
      .then(({ data }) => setEstudiantesBaja(data))
      .catch(() => toast.error("Error al obtener estudiantes de baja"));

    obtenerTodosLosTutores()
      .then(({ data }) => setTutores(data))
      .catch(() => toast.error("Error al obtener tutores"));

    obtenerTodasLasComisiones()
      .then(({ data }) => setComisiones(data))
      .catch(() => toast.error("Error al obtener comisiones"));

    obtenerTodosLosEventos()
      .then(({ data }) => setEventos(data))
      .catch(() => toast.error("Error al obtener eventos"));

    obtenerMetricasDeAsistenciaGlobal()
      .then(({ data }) => {
        const datosFormateados = data.map((item: any, i: number) => ({
          name: `enc. ${i + 1}`,
          asistencia: item.porcentajeAsistencia,
          tituloOriginal: item.evento.titulo,
        }));
        setLineData(datosFormateados);
      })
      .catch(() =>
        toast.error("Error al obtener métricas de evolución global"),
      );

    obtenerAnunciosGlobales()
      .then(({ data }) => setAnuncios(data))
      .catch(() => toast.error("Error al obtener anuncios globales"));
  }, [refreshTrigger]);

  const asignarComision = async (estudianteId: number, comisionId: string) => {
    try {
      await asignarEstudianteAComision(estudianteId, comisionId);
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
  const avgGlobal =
    totalEstudiantes > 0
      ? Math.round(
          (estudiantesActivos.reduce((total, estudiante) => {
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
            totalEstudiantes) *
            100,
        )
      : 0;

  const barData = comisiones.map((c) => ({
    name: "comision",
    asistencia: "No definido",
  }));

  const comisionData = comisiones.map((c) => {
    const t = tutores.find((tt) => tt.id === (c.tutor?.id || ""));
    return {
      localidad: c.localidad,
      departamento: c.departamento,
      carrera: c.carrera ? c.carrera : "No definida",
      numero: c.numero,
      horario: `${c.horarioInicio} - ${c.horarioFin}`,
      tutor: t ? `${t.apellido}, ${t.nombre}` : "No definido",
      aula: c.aula ? c.aula : "No definida",
    };
  });

  const tutorData = tutores.map((t) => ({
    apellido: t.apellido,
    nombre: t.nombre,
    mail: t.mail,
    comisiones: t.comisiones.length,
  }));

  const estudianteData = estudiantesActivos.map((e) => {
    var com: Comision | undefined;
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
    mail: e.mail,
    motivo: e.baja?.motivo ?? "—",
    detalle:
      e.baja?.detalle === "" || e.baja?.detalle == null
        ? "No especificado"
        : e.baja.detalle,
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

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left: Table */}
      <div className="flex-1 min-w-0">
        <DataTable
          columns={config.columns}
          data={config.data}
          view={view}
          onAdd={() => {
            if (view === "estudiantes") navigate("/admin/agregar-estudiante");
            if (view === "tutores") navigate("/admin/agregar-tutor");
            if (view === "comisiones") navigate("/admin/agregar-comision");
          }}
          addLabel={config.addLabel}
          onEdit={(row, index) => {
            const id = comisionIdPorIndice[index];
            if (view === "comisiones" && id)
              navigate(`/admin/editar-comision/${id}`);
            if (view === "tutores") {
              const tutorId = tutores[index].id;
              navigate(`/admin/editar-tutor/${tutorId}`);
            }
          }}
          onRowClick={(row, index) => {
            if (view === "comisiones") {
              const id = comisionIdPorIndice[index];
              navigate(`/comision/${id}`);
            }
          }}
          rowIds={rowIds}
          onDelete={(row, index) => {
            const dataCon = [...config.data];
            dataCon.splice(index, 1);
            config.data = dataCon;
            triggerRefresh();
            refreshPeople();
          }}
          onBulkAdd={view === "estudiantes" ? () => setCargaMasivaOpen(true) : undefined}
        />
        <div className="mt-4">
          <BotonExportar
            onCSV={exportarCSV}
            onExcel={exportarExcel}
            onPDF={exportarPDF}
          />
        </div>
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
              <div>
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
                          Mail
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
                          <td className="px-4 py-3 text-foreground">
                            {row.mail}
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
                <div className="mt-4">
                  <BotonExportar
                    onCSV={exportarCSVBajas}
                    onExcel={exportarExcelBajas}
                    onPDF={exportarPDFBajas}
                  />
                </div>
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

        <div>
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Calendario global
          </h3>
          <PanelCalendario eventos={eventos} onEventAdded={triggerRefresh} />
        </div>

        <div>
          <PanelAnuncios
            anuncios={anuncios}
            puedePublicar={true}
            comisionId={null}
            usuarioId={adminActualId}
            role={adminActualId ? "admin" : null}
            actualizarAnuncios={triggerRefresh}
          />
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Estudiantes totales dados de baja
          </h3>
          <MetricasGrafico />
        </div>

        {/* Line chart con nombres incrementales */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Evolución global
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value}%`,
                  `Asistencia (${props.payload.tituloOriginal || ""})`,
                ]}
              />
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
      <CargaMasivaEstudiantes
        open={cargaMasivaOpen}
        onClose={() => setCargaMasivaOpen(false)}
        onSuccess={triggerRefresh}
      />
    </div>
  );
}
