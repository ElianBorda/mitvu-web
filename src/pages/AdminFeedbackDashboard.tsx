import { useState, useEffect, useMemo, useRef } from "react";
import { MessageSquare, Star, Search, X } from "lucide-react";
import { FormularioFeedback } from "@/types/formularioFeedbackType";
import { obtenerTodosLosFormularioFeedback } from "@/service/apiFormulario";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import { obtenerTodasLasComisiones } from "@/service/apiComision";
import { Tutor } from "@/types/tutorType";
import { Comision } from "@/types/comisionType";
import { format } from "date-fns";
import { useExportarFormulario } from "@/hooks/useExportarFormulario";
import BotonExportarMetricas from "@/components/BotonExportarMetricas";

export default function AdminFeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState<FormularioFeedback[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [loading, setLoading] = useState(true);

  const refFormulario = useRef<HTMLDivElement>(null);
  const nombreExport = `formulario_feedback_anonimo_${new Date().toISOString().split("T")[0]}`;
  const { exportarPDF, exportarPNG } = useExportarFormulario(
    refFormulario,
    nombreExport,
  );
  const [selectedFeedback, setSelectedFeedback] =
    useState<FormularioFeedback | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([
      obtenerTodosLosFormularioFeedback(),
      obtenerTodosLosTutores(),
      obtenerTodasLasComisiones(),
    ])
      .then(([resFeed, resTut, resCom]) => {
        setFeedbacks(resFeed.data);
        setTutores(resTut.data);
        setComisiones(resCom.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // VERCEL BEST PRACTICE: Map Lookups (O(1)) para no hacer .find() dentro del render
  const tutoresMap = useMemo(
    () => new Map(tutores.map((t) => [String(t.id), t])),
    [tutores],
  );
  const comisionesMap = useMemo(
    () => new Map(comisiones.map((c) => [String(c.id), c])),
    [comisiones],
  );

  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((f) => {
        const t = tutoresMap.get(f.tutorId);
        const fullName = t ? `${t.nombre} ${t.apellido}`.toLowerCase() : "";
        return fullName.includes(searchTerm.toLowerCase());
      })
      .sort(
        (a, b) =>
          new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime(),
      ); // Más recientes primero
  }, [feedbacks, tutoresMap, searchTerm]);

  // Helper para renderizar estrellas fijas
  const StaticStars = ({ score }: { score: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={
            s <= score
              ? "text-yellow-500 fill-yellow-500"
              : "text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando reportes...
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="text-primary" />
            Análisis de Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisá la experiencia de los estudiantes y el desempeño de los
            tutores.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar por nombre de tutor..."
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center rounded-xl shadow-sm text-muted-foreground">
          No se encontraron reportes de feedback.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeedbacks.map((f) => {
            const tutor = tutoresMap.get(f.tutorId);
            const comision = comisionesMap.get(f.comisionId);
            const isGood = f.puntajeGeneralTutor >= 4;
            const isWarning = f.puntajeGeneralTutor <= 2;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFeedback(f)}
                className="bg-card border border-border p-5 rounded-xl shadow-card text-left hover:border-primary/50 transition-colors flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {tutor
                        ? `${tutor.nombre} ${tutor.apellido}`
                        : "Tutor Desconocido"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Comisión {comision?.numero || "?"} • Sede{" "}
                      {comision?.localidad || "?"}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-md text-xs font-bold ${isGood ? "bg-green-500/10 text-green-600" : isWarning ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"}`}
                  >
                    {f.puntajeGeneralTutor.toFixed(1)}
                  </div>
                </div>

                <div className="w-full h-px bg-border/50" />

                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                  {f.aspectosPositivos ||
                    f.oportunidadesMejora ||
                    f.comentariosAdicionales ||
                    "Sin comentarios textuales."}
                </p>

                <div className="flex justify-between items-center w-full mt-1">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {f.fechaEnvio.substring(0, 10)}
                  </span>
                  {f.recomiendaEspacio ? (
                    <span className="text-[10px] text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                      Recomienda
                    </span>
                  ) : (
                    <span className="text-[10px] text-destructive font-medium px-2 py-0.5 bg-destructive/10 rounded-full">
                      No recomienda
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALLE UX */}
      {selectedFeedback &&
        (() => {
          const t = tutoresMap.get(selectedFeedback.tutorId);
          const c = comisionesMap.get(selectedFeedback.comisionId);
          return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Detalle del Reporte
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Fecha: {selectedFeedback.fechaEnvio}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <BotonExportarMetricas
                      onPDF={exportarPDF}
                      onPNG={exportarPNG}
                      textoBoton="Exportar formulario"
                    />
                    <button
                      onClick={() => setSelectedFeedback(null)}
                      className="p-2 hover:bg-black/5 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div
                  ref={refFormulario}
                  className="p-6 overflow-y-auto space-y-8 custom-scrollbar"
                >
                  {/* Header info */}
                  <div className="flex flex-wrap gap-4 bg-secondary/20 p-4 rounded-lg border border-border">
                    <div className="flex-1 min-w-[150px]">
                      <span className="block text-xs text-muted-foreground uppercase tracking-wide">
                        Tutor Evaluado
                      </span>
                      <span className="font-semibold text-foreground">
                        {t ? `${t.nombre} ${t.apellido}` : "Desconocido"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <span className="block text-xs text-muted-foreground uppercase tracking-wide">
                        Comisión
                      </span>
                      <span className="font-semibold text-foreground">
                        {c
                          ? `Nro. ${c.numero} - ${c.localidad}`
                          : "Desconocida"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <span className="block text-xs text-muted-foreground uppercase tracking-wide">
                        Recomendación
                      </span>
                      <span
                        className={`font-semibold ${selectedFeedback.recomiendaEspacio ? "text-primary" : "text-destructive"}`}
                      >
                        {selectedFeedback.recomiendaEspacio
                          ? "Recomienda el espacio"
                          : "No lo recomienda"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Scores */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold border-b border-border pb-1">
                        Calificaciones
                      </h3>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Puntaje General
                        </span>{" "}
                        <StaticStars
                          score={selectedFeedback.puntajeGeneralTutor}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Claridad</span>{" "}
                        <StaticStars
                          score={selectedFeedback.claridadYComunicacion}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Disponibilidad
                        </span>{" "}
                        <StaticStars
                          score={selectedFeedback.disponibilidadYRespuesta}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Empatía</span>{" "}
                        <StaticStars score={selectedFeedback.tratoYEmpatia} />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Apoyo Institucional
                        </span>{" "}
                        <StaticStars
                          score={selectedFeedback.acompanamientoInstitucional}
                        />
                      </div>
                    </div>

                    {/* Respuestas cerradas */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold border-b border-border pb-1">
                        Dinámica de Comisión
                      </h3>
                      <div className="text-sm">
                        <span className="block text-muted-foreground mb-0.5">
                          Utilidad de encuentros:
                        </span>{" "}
                        <span className="font-medium">
                          {selectedFeedback.utilidadEncuentros}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="block text-muted-foreground mb-0.5">
                          Frecuencia y cantidad:
                        </span>{" "}
                        <span className="font-medium">
                          {selectedFeedback.frecuenciaYAsistencia}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="block text-muted-foreground mb-0.5">
                          Organización y horarios:
                        </span>{" "}
                        <span className="font-medium">
                          {selectedFeedback.organizacion}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comentarios */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold border-b border-border pb-1">
                      Comentarios Libres
                    </h3>
                    {selectedFeedback.aspectosPositivos && (
                      <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-md">
                        <strong className="block text-xs text-green-700 uppercase mb-1">
                          Aspectos Positivos
                        </strong>
                        <p className="text-sm text-foreground">
                          {selectedFeedback.aspectosPositivos}
                        </p>
                      </div>
                    )}
                    {selectedFeedback.oportunidadesMejora && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-md">
                        <strong className="block text-xs text-yellow-700 uppercase mb-1">
                          Oportunidades de Mejora
                        </strong>
                        <p className="text-sm text-foreground">
                          {selectedFeedback.oportunidadesMejora}
                        </p>
                      </div>
                    )}
                    {selectedFeedback.comentariosAdicionales && (
                      <div className="bg-secondary/20 border border-border p-3 rounded-md">
                        <strong className="block text-xs text-muted-foreground uppercase mb-1">
                          Adicionales
                        </strong>
                        <p className="text-sm text-foreground">
                          {selectedFeedback.comentariosAdicionales}
                        </p>
                      </div>
                    )}
                    {!selectedFeedback.aspectosPositivos &&
                      !selectedFeedback.oportunidadesMejora &&
                      !selectedFeedback.comentariosAdicionales && (
                        <p className="text-sm text-muted-foreground italic">
                          El estudiante no dejó comentarios escritos.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
