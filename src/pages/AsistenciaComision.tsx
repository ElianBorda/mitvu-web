import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import {
  obtenerEstudiantesDeComision,
  pasarAsistenciaDeEstudiante,
} from "@/service/apiEstudiante";
import { obtenerTodosLosEventos } from "@/service/apiEvento";
import { getObtenerComision } from "@/service/apiComision";
import { Evento } from "@/types/eventoType";
import { Comision } from "@/types/comisionType";
import { Asistencia } from "@/types/asistenciaType";
import { toast } from "sonner";

type EstadoAsistencia = "PRESENTE" | "AUSENTE" | "AUSENCIA_JUSTIFICADA" | null;

const OPCIONES: { value: EstadoAsistencia; label: string; clase: string }[] = [
  {
    value: "PRESENTE",
    label: "Presente",
    clase: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "AUSENTE",
    label: "Ausente",
    clase: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "AUSENCIA_JUSTIFICADA",
    label: "Ausencia justif.",
    clase: "bg-sky-100 text-sky-800 border-sky-200",
  },
];

const clasesPorEstado: Record<string, string> = {
  PRESENTE: "bg-green-100 text-green-700 border-green-200",
  AUSENTE: "bg-red-100 text-red-700 border-red-200",
  AUSENCIA_JUSTIFICADA: "bg-sky-100 text-sky-800 border-sky-200",
};

export default function AsistenciaComision() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [comision, setComision] = useState<Comision | null>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const [asistencia, setAsistencia] = useState<
    Record<string, Record<string, EstadoAsistencia>>
  >({});

  const [celdaAbierta, setCeldaAbierta] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const cargar = async () => {
      try {
        const [comisionRes, estudiantesRes, eventosRes] = await Promise.all([
          getObtenerComision(id),
          obtenerEstudiantesDeComision(id),
          obtenerTodosLosEventos(),
        ]);

        const estudiantesCargados = estudiantesRes.data;
        const eventosCargados: Evento[] = eventosRes.data;

        setComision(comisionRes.data);
        setEstudiantes(estudiantesCargados);
        setEventos(eventosCargados);

        const fechaAEventoId: Record<string, string> = {};
        eventosCargados.forEach((ev) => {
          // Convertir la fecha a formato YYYY-MM-DD si viene en otro formato
          const partes = ev.fecha.split("-");
          const fechaNormalizada =
            partes[0].length === 4
              ? ev.fecha
              : `${partes[2]}-${partes[1]}-${partes[0]}`;

          fechaAEventoId[fechaNormalizada] = ev.id;
        });

        const asistenciaInicial: Record<
          string,
          Record<string, EstadoAsistencia>
        > = {};
        estudiantesCargados.forEach((e: any) => {
          asistenciaInicial[e.id] = {};
          (e.asistencias ?? []).forEach(
            (a: { fecha: string; tipoDeAsistencia: EstadoAsistencia }) => {
              const eventoId = fechaAEventoId[a.fecha];
              if (eventoId) {
                asistenciaInicial[e.id][eventoId] = a.tipoDeAsistencia;
              }
            },
          );
        });

        setAsistencia(asistenciaInicial);
      } catch (error) {
        console.error("Error al cargar datos de asistencia:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const setEstado = async (
    estudianteId: string,
    eventoId: string,
    fechaEvento: string,
    tipoDeAsistencia: EstadoAsistencia,
  ) => {
    const asistencia: Asistencia = {
      fecha: fechaEvento,
      tipoDeAsistencia: tipoDeAsistencia,
    };
    try {
      await pasarAsistenciaDeEstudiante(estudianteId, asistencia);
    } catch (error) {
      toast.error("Error al guardar la asistencia.");
    }
    setCeldaAbierta(null);
    setAsistencia((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [eventoId]: tipoDeAsistencia,
      },
    }));
  };

  const celdaKey = (eId: string, evId: string) => `${eId}-${evId}`;

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm p-6">
        Cargando asistencia...
      </p>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft size={15} />
            Volver al panel de la comisión
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ClipboardList size={20} className="text-primary" />
        <h1 className="text-xl font-bold text-foreground">
          Tomar asistencia —{" "}
          {comision
            ? `Comisión ${comision.numero} · ${comision.localidad} · Dep. ${comision.departamento}`
            : `Comisión ${id}`}
        </h1>
      </div>

      {/* Tabla */}
      {eventos.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-6 py-10 text-center text-sm text-muted-foreground">
          Aún no hay eventos de cursada registrados.
        </div>
      ) : estudiantes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-6 py-10 text-center text-sm text-muted-foreground">
          No hay estudiantes en esta comisión.
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-card border border-border overflow-x-visible">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="px-4 py-3 text-left font-medium sticky left-0 bg-primary z-10 min-w-[180px]">
                  Estudiante
                </th>
                {eventos.map((ev) => (
                  <th
                    key={ev.id}
                    className="px-3 py-3 text-center font-medium min-w-[130px] whitespace-nowrap"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-semibold">
                        {ev.fecha.split("T")[0].split("-").join("/")}
                      </span>
                      <span className="text-[10px] opacity-75 truncate max-w-[110px]">
                        {ev.titulo ?? "Encuentro"}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((e, i) => (
                <tr
                  key={e.id}
                  className={`${i % 2 === 0 ? "bg-card" : "bg-[hsl(350,50%,98%)]"} hover:bg-secondary/40 transition-colors`}
                >
                  {/* Nombre del estudiante */}
                  <td className="px-4 py-2.5 font-medium text-foreground sticky left-0 bg-inherit z-10 border-r border-border">
                    {e.apellido}, {e.nombre}
                  </td>

                  {/* Celda por evento */}
                  {eventos.map((ev) => {
                    const key = celdaKey(e.id, ev.id);
                    const tipoDeAsistencia = asistencia[e.id]?.[ev.id] ?? null;
                    const opcion = OPCIONES.find(
                      (o) => o.value === tipoDeAsistencia,
                    );
                    const abierta = celdaAbierta === key;

                    return (
                      <td
                        key={ev.id}
                        className="px-2 py-2 text-center relative"
                      >
                        <button
                          onClick={() => setCeldaAbierta(abierta ? null : key)}
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-xs font-medium transition-all w-28
                            ${
                              opcion
                                ? clasesPorEstado[tipoDeAsistencia!]
                                : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                            }`}
                        >
                          {opcion ? opcion.label : "—"}
                        </button>

                        {/* Dropdown */}
                        {abierta && (
                          <>
                            {/* Overlay para cerrar al hacer click fuera */}
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setCeldaAbierta(null)}
                            />
                            <div className="absolute z-30 mt-1 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-lg py-1.5 min-w-[160px] flex flex-col gap-0.5">
                              {OPCIONES.map((op) => (
                                <button
                                  key={op.value}
                                  onClick={() =>
                                    setEstado(
                                      e.id,
                                      ev.id,
                                      ev.fecha.split("-").reverse().join("-"),
                                      op.value,
                                    )
                                  }
                                  className={`mx-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:opacity-80 ${op.clase}`}
                                >
                                  {op.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
