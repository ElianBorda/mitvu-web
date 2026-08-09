import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import {
  obtenerMetricasDeBajaDeEstudiantesDeComision,
  obtenerMetricasDeAsistenciaPorComision,
} from "@/service/apiMetrica";
import BotonExportarMetricas from "./BotonExportarMetricas";
import { Comision } from "@/types/comisionType";
import { getObtenerComision } from "@/service/apiComision";
import { useExportarMetricas } from "@/hooks/useExportarMetricas";

type Props = {
  comisionId: string;
  numeroComision: string | number;
};

export default function MetricasLargoComision({
  comisionId,
  numeroComision,
}: Props) {
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [barData, setBarData] = useState<any[]>([]); // Nuevo estado para las barras

  const [loadingPie, setLoadingPie] = useState(true);
  const [loadingBar, setLoadingBar] = useState(true);

  // Colores para la dona
  const COLORS_PIE = ["#800000", "#16a34a"];

  // Colores para las barras apiladas
  const COLOR_PRESENTE = "#16a34a"; // Verde
  const COLOR_JUSTIFICADA = "#0ea5e9"; // Celeste
  const COLOR_AUSENTE = "#800000"; // Rojo oscuro (tu color principal)

  const refMetricas = useRef<HTMLDivElement>(null);
  const [comision, setComision] = useState<Comision>(null);
  const { exportarPDF, exportarPNG } = useExportarMetricas(
    refMetricas,
    comision,
  );

  useEffect(() => {
    // 1. Petición para la Dona (Activos vs Bajas)
    obtenerMetricasDeBajaDeEstudiantesDeComision(comisionId)
      .then(({ data }) => {
        setPieData([
          { name: "Bajas", value: data.cantidadDeEstudiantesDadoDeBaja },
          { name: "Activos", value: data.cantidadDeEstudiantesActivos },
        ]);
      })
      .catch(() => toast.error("No se pudieron cargar las métricas de estado"))
      .finally(() => setLoadingPie(false));

    // 2. Petición para las Barras (Asistencias detalladas por encuentro)
    obtenerMetricasDeAsistenciaPorComision(comisionId)
      .then(({ data }) => {
        // Formateamos los datos para Recharts
        const datosFormateados = data.map((item: any, i: number) => ({
          name: `enc. ${i + 1}`,
          tituloOriginal: item.evento?.titulo || `Encuentro ${i + 1}`,
          Presentes: item.porcentajeAsistencia,
          "Faltas Justificadas": item.porcentajeFaltaJustificada,
          Ausentes: item.porcentajeFalta,
        }));
        setBarData(datosFormateados);
      })
      .catch(() =>
        toast.error("No se pudieron cargar las métricas de asistencia"),
      )
      .finally(() => setLoadingBar(false));

    getObtenerComision(comisionId)
      .then(({ data }) => setComision(data))
      .catch(() =>
        toast.error("No se pudo cargar la información de la comisión"),
      );
  }, [comisionId]);

  const bajasCount = pieData.find((d) => d.name === "Bajas")?.value || 0;
  const activosCount = pieData.find((d) => d.name === "Activos")?.value || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Métricas de presencialidad — Comisión {numeroComision}
        </h2>
        <BotonExportarMetricas onPDF={exportarPDF} onPNG={exportarPNG} textoBoton="Exportar métricas" />
      </div>

      {/* Gráfico de Barras Apiladas */}
      <div ref={refMetricas}>
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Evolución de asistencia por encuentro
          </h3>

          {loadingBar ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              Cargando métricas de asistencia...
            </div>
          ) : barData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              Aún no hay encuentros con asistencias registradas.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                {/* Formateamos el eje Y para que muestre el símbolo de porcentaje */}
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(tick) => `${tick}%`}
                />
                <Tooltip
                  // Le pasamos el título original del evento al encabezado del Tooltip
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0)
                      return payload[0].payload.tituloOriginal;
                    return label;
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ paddingTop: "15px" }} />
                {/* stackId="a" hace que se apilen una arriba de la otra */}
                <Bar dataKey="Presentes" stackId="a" fill={COLOR_PRESENTE} />
                <Bar
                  dataKey="Faltas Justificadas"
                  stackId="a"
                  fill={COLOR_JUSTIFICADA}
                />
                {/* La última barra apilada lleva los bordes superiores redondeados */}
                <Bar
                  dataKey="Ausentes"
                  stackId="a"
                  fill={COLOR_AUSENTE}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de Torta (Estado de estudiantes) */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Estado de los estudiantes
          </h3>

          {loadingPie ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              Cargando métricas...
            </div>
          ) : pieData.every((d) => d.value === 0) ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No hay estudiantes registrados en esta comisión.
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} estudiantes`]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="ml-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS_PIE[1] }}
                  />
                  <span className="text-foreground font-medium">
                    Activos: {activosCount}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS_PIE[0] }}
                  />
                  <span className="text-foreground font-medium">
                    Bajas: {bajasCount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
