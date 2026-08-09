import { useState, useRef } from "react";
import { Plus, BarChart2 } from "lucide-react";
import MetricaWidget from "@/components/MetricaWidget";
import { TipoMetrica, Agrupacion, TipoCalculo } from "@/types/MetricaType";
import { useExportarMetricas } from "@/hooks/useExportarMetricas";
import BotonExportarMetricas from "@/components/BotonExportarMetricas";

export default function MetricasDashboard() {
  const [widgets, setWidgets] = useState([{ id: "default-1" }]);
  const refGrilla = useRef<HTMLDivElement>(null);

  const nombreExport = `dashboard_metricas_${new Date().toISOString().split("T")[0]}`;
  const { exportarPDF, exportarPNG } = useExportarMetricas(refGrilla, null, nombreExport);

  const addWidget = () => {
    setWidgets([...widgets, { id: `widget-${Date.now()}` }]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="text-primary" />
            Análisis y Métricas Avanzadas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explora la evolución de asistencias y tasas de deserción combinando filtros interactivos.
          </p>
        </div>
        <div className="flex items-center gap-2"> {/* ← flex para poner los dos botones juntos */}
          {widgets.length > 0 && ( // ← solo aparece si hay al menos un widget
            <BotonExportarMetricas onPDF={exportarPDF} onPNG={exportarPNG} textoBoton="Exportar todos los gráficos" />
          )}
          <button
            onClick={addWidget}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nuevo Gráfico
          </button>
        </div>
      </div>

      {/* Grilla — el ref envuelve solo los widgets */}
      {widgets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
          <BarChart2 size={40} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">El panel está vacío</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Agrega un nuevo gráfico para comenzar a analizar los datos.
          </p>
          <button onClick={addWidget} className="text-primary text-sm font-medium hover:underline">
            + Agregar Gráfico
          </button>
        </div>
      ) : (
        <div ref={refGrilla} className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-background p-2 rounded-xl">
          {widgets.map((widget, index) => (
            <div key={widget.id} className={widgets.length === 1 ? "lg:col-span-2" : ""}>
              <MetricaWidget
                id={widget.id}
                onRemove={removeWidget}
                defaultMetrica={index === 0 ? TipoMetrica.ASISTENCIA : undefined}
                defaultAgrupacion={index === 0 ? Agrupacion.FECHA : undefined}
                defaultCalculo={index === 0 ? TipoCalculo.CANTIDAD : undefined}
                defaultChartType={index === 0 ? "LINE" : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}