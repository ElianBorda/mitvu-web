import { useState, useEffect, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Settings2, Trash2, PieChart as PieIcon, BarChart3, LineChart as LineIcon, Hash } from "lucide-react";
import { 
  TipoMetrica, Agrupacion, TipoCalculo, MotivoBaja, FiltroMetricaBody, DataPoint, 
  TipoDeAsistencia
} from "@/types/MetricaType";
import { obtenerMetricasDinamicas } from "@/service/apiMetrica";
import { toast } from "sonner";

const CHART_COLORS = ["hsl(350,82%,27%)", "#16a34a", "#0ea5e9", "#ca8a04", "#9333ea", "#ea580c"];

type ChartType = "LINE" | "BAR" | "PIE" | "KPI";

interface Props {
  id: string;
  onRemove: (id: string) => void;
  defaultMetrica?: TipoMetrica;
  defaultAgrupacion?: Agrupacion;
  defaultCalculo?: TipoCalculo;
  defaultChartType?: ChartType;
}

export default function MetricaWidget({ 
  id, onRemove, 
  defaultMetrica = TipoMetrica.ASISTENCIA, 
  defaultAgrupacion = Agrupacion.FECHA, 
  defaultCalculo = TipoCalculo.CANTIDAD,
  defaultChartType = "LINE"
}: Props) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [tipoGrafico, setTipoGrafico] = useState<ChartType>(defaultChartType);
  const [tipoMetrica, setTipoMetrica] = useState<TipoMetrica>(defaultMetrica);
  const [agruparPor, setAgruparPor] = useState<Agrupacion>(defaultAgrupacion);
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>(defaultCalculo);
  const [motivoBaja, setMotivoBaja] = useState<MotivoBaja | "">("");
  const [tipoDeAsistencia, setTipoDeAsistencia] = useState<TipoDeAsistencia | "">("");
  
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const formatearFechaParaBackend = (fechaHtml: string) => {
    if (!fechaHtml) return undefined;
    const [year, month, day] = fechaHtml.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const filtro: FiltroMetricaBody = {
      tipoMetrica,
      agruparPor,
      tipoCalculo,
      ...(tipoDeAsistencia ? { tipoDeAsistencia } : {}),
      ...(motivoBaja ? { motivoBaja } : {}),
      ...(fechaInicio ? { fechaInicio: formatearFechaParaBackend(fechaInicio) } : {}),
      ...(fechaFin ? { fechaFin: formatearFechaParaBackend(fechaFin) } : {})
    };

    obtenerMetricasDinamicas(filtro)
      .then(({ data }) => {
        setData(data);
      })
      .catch(() => {
        toast.error("Error al obtener datos para el gráfico");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [tipoMetrica, agruparPor, tipoCalculo, motivoBaja, fechaInicio, fechaFin, tipoDeAsistencia]);

  const chartData = useMemo(() => {
    if (agruparPor === Agrupacion.FECHA) {
      return [...data].sort((a, b) => {
        const [d1, m1, y1] = a.etiqueta.split('-');
        const [d2, m2, y2] = b.etiqueta.split('-');
        return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
      });
    }
    return data;
  }, [data, agruparPor]);

  const kpiValue = useMemo(() => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.valor, 0);
    return tipoCalculo === TipoCalculo.PORCENTAJE ? Math.round(sum / data.length) : sum;
  }, [data, tipoCalculo]);

  const agrupacionesDisponibles = Object.values(Agrupacion).filter(a => {
    if (tipoMetrica === TipoMetrica.ASISTENCIA && a === Agrupacion.MOTIVO) return false;
    return true;
  });
  
  const showMotivoBajaSelect = tipoMetrica === TipoMetrica.BAJA && agruparPor === Agrupacion.MOTIVO;
  const showTipoAsistenciaSelect = tipoMetrica === TipoMetrica.ASISTENCIA;

  const renderChart = () => {
    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Cargando métricas...</div>;
    if (!data.length) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No hay datos para estos filtros.</div>;

    const tickFormatter = (val: number) => tipoCalculo === TipoCalculo.PORCENTAJE ? `${val}%` : val.toString();
    const tooltipFormatter = (val: number) => [tipoCalculo === TipoCalculo.PORCENTAJE ? `${val.toFixed(1)}%` : val, tipoMetrica];

    switch (tipoGrafico) {
      case "LINE":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val} />
              <YAxis domain={[0, tipoCalculo === TipoCalculo.PORCENTAJE ? 100 : 'auto']} tick={{ fontSize: 11 }} tickFormatter={tickFormatter} />
              <Tooltip formatter={tooltipFormatter} />
              <Line type="monotone" dataKey="valor" stroke="hsl(350,82%,27%)" strokeWidth={3} dot={{ fill: "hsl(350,82%,27%)" }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "BAR":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 10)}...` : val} />
              <YAxis domain={[0, tipoCalculo === TipoCalculo.PORCENTAJE ? 100 : 'auto']} tick={{ fontSize: 11 }} tickFormatter={tickFormatter} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="valor" fill="hsl(350,82%,27%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "PIE":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="valor" nameKey="etiqueta">
                {chartData.map((_, i) => <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={tooltipFormatter} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case "KPI":
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-5xl font-bold text-primary">{kpiValue}{tipoCalculo === TipoCalculo.PORCENTAJE ? "%" : ""}</p>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">
              {tipoCalculo} DE {tipoMetrica} TOTAL ({agruparPor})
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-card flex flex-col h-[400px] overflow-hidden relative group">
      {/* Header del Widget */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
           {tipoGrafico === 'LINE' && <LineIcon size={16} className="text-primary"/>}
           {tipoGrafico === 'BAR' && <BarChart3 size={16} className="text-primary"/>}
           {tipoGrafico === 'PIE' && <PieIcon size={16} className="text-primary"/>}
           {tipoGrafico === 'KPI' && <Hash size={16} className="text-primary"/>}
           Análisis Dinámico
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-md transition-colors">
            <Settings2 size={16} />
          </button>
          <button onClick={() => onRemove(id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Panel de Configuración Colapsable */}
      {showSettings && (
        <div className="bg-secondary/50 p-4 border-b border-border grid grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-muted-foreground">Tipo de Gráfico</label>
            <select value={tipoGrafico} onChange={(e) => setTipoGrafico(e.target.value as ChartType)} className="p-1.5 rounded-md border border-border bg-card">
              <option value="LINE">Líneas (Evolución)</option>
              <option value="BAR">Barras (Comparación)</option>
              <option value="PIE">Circular (Distribución)</option>
              <option value="KPI">Tarjeta (Resumen)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-muted-foreground">Métrica</label>
            <select 
              value={tipoMetrica} 
              onChange={(e) => {
                const nuevaMetrica = e.target.value as TipoMetrica;
                setTipoMetrica(nuevaMetrica);
                if (nuevaMetrica === TipoMetrica.ASISTENCIA && agruparPor === Agrupacion.MOTIVO) {
                  setAgruparPor(Agrupacion.FECHA);
                }
              }} 
              className="p-1.5 rounded-md border border-border bg-card"
            >
              {Object.values(TipoMetrica).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-muted-foreground">Agrupar Por</label>
            <select value={agruparPor} onChange={(e) => setAgruparPor(e.target.value as Agrupacion)} className="p-1.5 rounded-md border border-border bg-card">
              {agrupacionesDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-muted-foreground">Cálculo</label>
            <select value={tipoCalculo} onChange={(e) => setTipoCalculo(e.target.value as TipoCalculo)} className="p-1.5 rounded-md border border-border bg-card">
              {Object.values(TipoCalculo).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-muted-foreground">Desde (Opcional)</label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="p-1.5 rounded-md border border-border bg-card text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-muted-foreground">Hasta (Opcional)</label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              className="p-1.5 rounded-md border border-border bg-card text-foreground"
            />
          </div>
          
          {showMotivoBajaSelect && (
             <div className="flex flex-col gap-1 xl:col-span-2">
               <label className="font-medium text-muted-foreground">Filtrar por Motivo Específico (Opcional)</label>
               <select value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value as MotivoBaja)} className="p-1.5 rounded-md border border-border bg-card">
                 <option value="">Todos los motivos</option>
                 {Object.values(MotivoBaja).map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
               </select>
             </div>
          )}

           {showTipoAsistenciaSelect && (
             <div className="flex flex-col gap-1 xl:col-span-2">
               <label className="font-medium text-muted-foreground">Filtrar por Tipo de Asistencia (Opcional)</label>
               <select value={tipoDeAsistencia} onChange={(e) => setTipoDeAsistencia(e.target.value as TipoDeAsistencia)} className="p-1.5 rounded-md border border-border bg-card">
                 <option value="">Todos los tipos</option>
                 {Object.values(TipoDeAsistencia).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
               </select>
             </div>
          )}
        </div>
      )}

      {/* Renderizado del Gráfico */}
      <div className="flex-1 p-4 pb-8 min-h-0">
        {renderChart()}
      </div>
    </div>
  );
}