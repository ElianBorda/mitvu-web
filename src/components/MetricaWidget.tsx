import { useState, useEffect, useMemo, useRef } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Settings2, Trash2, PieChart as PieIcon, BarChart3, LineChart as LineIcon, Hash, Activity } from "lucide-react";
import { 
  TipoMetrica, Agrupacion, TipoCalculo, MotivoBaja, FiltroMetricaBody, DataPoint, 
  TipoDeAsistencia
} from "@/types/MetricaType";
import { obtenerMetricasDinamicas } from "@/service/apiMetrica";
import { obtenerTodasLasComisiones } from "@/service/apiComision";
import { toast } from "sonner";
import { useExportarMetricas } from "@/hooks/useExportarMetricas";
import BotonExportarMetricas from "./BotonExportarMetricas";

const CHART_COLORS = [
  "hsl(350,82%,27%)", "#16a34a", "#0ea5e9", "#ca8a04", 
  "#9333ea", "#ea580c", "#475569", "#db2777", 
  "#14b8a6", "#8b5cf6", "#f43f5e", "#84cc16"
];

type ChartType = "LINE" | "BAR" | "PIE" | "KPI" | "MULTILINE";
type ComparativaMode = "COMISION" | "LOCALIDAD";

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
  const [multiData, setMultiData] = useState<any[]>([]);
  const [lineasMulti, setLineasMulti] = useState<{ id: string; name: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [tipoGrafico, setTipoGrafico] = useState<ChartType>(defaultChartType);
  const [tipoMetrica, setTipoMetrica] = useState<TipoMetrica>(defaultMetrica);
  const [agruparPor, setAgruparPor] = useState<Agrupacion>(defaultAgrupacion);
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>(defaultCalculo);
  
  const [compararPor, setCompararPor] = useState<ComparativaMode>("COMISION");

  const [motivoBaja, setMotivoBaja] = useState<MotivoBaja | "">("");
  const [tipoDeAsistencia, setTipoDeAsistencia] = useState<TipoDeAsistencia | "">("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [localidad, setLocalidad] = useState("");
  
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState<string[]>([]);

  const refWidget = useRef<HTMLDivElement>(null);
  const nombreExport = `metrica_de_${tipoMetrica}_agrupada_por_${agruparPor}_calculada_como_${tipoCalculo}_${new Date().toISOString().split("T")[0]}`;
  const { exportarPDF, exportarPNG } = useExportarMetricas(refWidget, null, nombreExport);

  const formatearFechaParaBackend = (fechaHtml: string) => {
    if (!fechaHtml) return undefined;
    const [year, month, day] = fechaHtml.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    obtenerTodasLasComisiones()
      .then((res) => {
        const comisiones = res.data || [];
        const localidadesUnicas = Array.from(
          new Set(comisiones.map((c: any) => c.localidad).filter(Boolean))
        ).sort() as string[];
        
        setLocalidadesDisponibles(localidadesUnicas);
      })
      .catch(() => console.error("Fallo silencioso al cargar localidades."));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    if (tipoGrafico === "MULTILINE") {
      obtenerTodasLasComisiones()
        .then((resComisiones) => {
          const comisiones = resComisiones.data || [];
          if (comisiones.length === 0) {
            setMultiData([]); setLineasMulti([]); setLoading(false); return;
          }

          // SIEMPRE consultamos por idComision para evitar el bug del backend con la localidad
          const promesas = comisiones.map((c: any, index: number) => {
            const filtro: FiltroMetricaBody = {
              tipoMetrica,
              agruparPor: Agrupacion.FECHA, 
              tipoCalculo,
              idComision: c.id, 
              ...(tipoDeAsistencia ? { tipoDeAsistencia } : {}),
              ...(motivoBaja ? { motivoBaja } : {}),
              ...(fechaInicio ? { fechaInicio: formatearFechaParaBackend(fechaInicio) } : {}),
              ...(fechaFin ? { fechaFin: formatearFechaParaBackend(fechaFin) } : {}),
            };

            return obtenerMetricasDinamicas(filtro)
              .then(res => ({ comision: c, fallbackId: index, resultados: res.data || [] }))
              .catch(() => ({ comision: c, fallbackId: index, resultados: [] }));
          });

          Promise.all(promesas)
            .then((respuestas) => {
              const mapFechas = new Map<string, any>();
              const lineasGeneradas: { id: string; name: string }[] = [];

              respuestas.forEach(res => {
                // Si la comisión no tiene datos reales de asistencia, la ignoramos.
                if (!res.resultados || res.resultados.length === 0) return;

                let idKey = "";
                let nombreDisplay = "";

                // Definimos a qué "Grupo" (Línea) pertenece esta comisión
                if (compararPor === "COMISION") {
                  idKey = res.comision.id ? String(res.comision.id) : `fallback-${res.fallbackId}`;
                  nombreDisplay = `Com. ${res.comision.numero} - ${res.comision.carrera || res.comision.localidad || 'S/L'}`;
                } else {
                  // Agrupamos por Sede
                  const loc = res.comision.localidad || 'S/L';
                  idKey = `loc-${loc}`;
                  nombreDisplay = `Sede ${loc}`;
                }

                if (!lineasGeneradas.some(l => l.id === idKey)) {
                  lineasGeneradas.push({ id: idKey, name: nombreDisplay });
                }
                
                // Guardamos los valores crudos en un arreglo para luego promediarlos o sumarlos
                res.resultados.forEach((dp: DataPoint) => {
                  if (!mapFechas.has(dp.etiqueta)) {
                    mapFechas.set(dp.etiqueta, { etiqueta: dp.etiqueta, _rawValues: {} });
                  }
                  const row = mapFechas.get(dp.etiqueta);
                  
                  if (!row._rawValues[idKey]) {
                    row._rawValues[idKey] = [];
                  }
                  row._rawValues[idKey].push(dp.valor);
                });
              });

              // Fusión Matemática (Sumar Cantidades o Promediar Porcentajes por Sede)
              const arregloFusionado = Array.from(mapFechas.values()).map(row => {
                const finalRow: any = { etiqueta: row.etiqueta };
                
                Object.keys(row._rawValues).forEach(key => {
                  const vals = row._rawValues[key] as number[];
                  if (vals.length === 0) return;

                  if (tipoCalculo === TipoCalculo.PORCENTAJE) {
                    finalRow[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
                  } else {
                    finalRow[key] = Math.round(vals.reduce((a, b) => a + b, 0));
                  }
                });
                return finalRow;
              });
              
              arregloFusionado.sort((a, b) => {
                if (!a.etiqueta || !b.etiqueta) return 0;
                const [d1, m1, y1] = String(a.etiqueta).split('-');
                const [d2, m2, y2] = String(b.etiqueta).split('-');
                return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
              });

              setMultiData(arregloFusionado);
              setLineasMulti(lineasGeneradas);
            })
            .catch(() => toast.error("Error al procesar las métricas multilínea"))
            .finally(() => setLoading(false));

        })
        .catch(() => {
          toast.error("Error al obtener las comisiones");
          setLoading(false);
        });

    } else {
      const filtro: FiltroMetricaBody = {
        tipoMetrica,
        agruparPor,
        tipoCalculo,
        ...(tipoDeAsistencia ? { tipoDeAsistencia } : {}),
        ...(motivoBaja ? { motivoBaja } : {}),
        ...(fechaInicio ? { fechaInicio: formatearFechaParaBackend(fechaInicio) } : {}),
        ...(fechaFin ? { fechaFin: formatearFechaParaBackend(fechaFin) } : {}),
        ...(localidad ? { localidad } : {})
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
    }
  }, [tipoGrafico, tipoMetrica, agruparPor, tipoCalculo, motivoBaja, fechaInicio, fechaFin, tipoDeAsistencia, localidad, compararPor]);

  const chartData = useMemo(() => {
    if (agruparPor === Agrupacion.FECHA) {
      return [...data].sort((a, b) => {
        if (!a.etiqueta || !b.etiqueta) return 0;
        const [d1, m1, y1] = String(a.etiqueta).split('-');
        const [d2, m2, y2] = String(b.etiqueta).split('-');
        return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
      });
    }
    if (agruparPor === Agrupacion.LOCALIDAD) {
      return [...data].sort((a, b) => (a.etiqueta || "").localeCompare(b.etiqueta || ""));
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
    if (tipoGrafico === "MULTILINE" && a !== Agrupacion.FECHA) return false; 
    return true;
  });
  
  const showMotivoBajaSelect = tipoMetrica === TipoMetrica.BAJA && agruparPor === Agrupacion.MOTIVO;
  const showTipoAsistenciaSelect = tipoMetrica === TipoMetrica.ASISTENCIA;
  const showFiltroLocalidadGlobal = !(tipoGrafico === "MULTILINE" && compararPor === "LOCALIDAD");

  const renderMultiTooltip = ({ active, payload, label }: any) => {
    if (active ? (payload && payload.length) : false) {
      const validPayload = payload.filter((p: any) => p.value != null);
      
      if (validPayload.length === 0) return null;

      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl text-xs z-50 min-w-[220px]">
          <p className="font-semibold text-foreground mb-2 pb-2 border-b border-border">{label}</p>
          <div className="max-h-48 overflow-y-auto pr-1">
            {validPayload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 mb-1.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground truncate" title={entry.name}>{entry.name}</span>
                </div>
                <span className="font-medium text-foreground shrink-0">
                  {tipoCalculo === TipoCalculo.PORCENTAJE ? `${Number(entry.value).toFixed(1)}%` : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderMultiLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center max-h-16 overflow-y-auto mt-3 px-2 custom-scrollbar">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="truncate max-w-[150px]" title={entry.value}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Cargando métricas...</div>;
    
    if (tipoGrafico === "MULTILINE" ? (multiData.length === 0) : false) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No hay datos para estos filtros.</div>;
    if (tipoGrafico !== "MULTILINE" ? (!data.length) : false) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No hay datos para estos filtros.</div>;

    const tickFormatter = (val: number) => tipoCalculo === TipoCalculo.PORCENTAJE ? `${val}%` : val.toString();
    const tooltipFormatter = (val: number) => [tipoCalculo === TipoCalculo.PORCENTAJE ? `${Number(val).toFixed(1)}%` : val, tipoMetrica];

    switch (tipoGrafico) {
      case "MULTILINE":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={multiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} tickFormatter={(val) => val && val.length > 15 ? `${val.substring(0, 15)}...` : val} />
              <YAxis domain={[0, tipoCalculo === TipoCalculo.PORCENTAJE ? 100 : 'auto']} tick={{ fontSize: 11 }} tickFormatter={tickFormatter} />
              
              <Tooltip content={renderMultiTooltip} />
              <Legend content={renderMultiLegend} />
              
              {lineasMulti.map((linea, index) => (
                <Line 
                  key={linea.id} 
                  type="monotone" 
                  name={linea.name}
                  dataKey={linea.id}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "LINE":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} tickFormatter={(val) => val && val.length > 15 ? `${val.substring(0, 15)}...` : val} />
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
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} tickFormatter={(val) => val && val.length > 10 ? `${val.substring(0, 10)}...` : val} />
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
           {tipoGrafico === 'LINE' ? <LineIcon size={16} className="text-primary"/> : null}
           {tipoGrafico === 'BAR' ? <BarChart3 size={16} className="text-primary"/> : null}
           {tipoGrafico === 'PIE' ? <PieIcon size={16} className="text-primary"/> : null}
           {tipoGrafico === 'KPI' ? <Hash size={16} className="text-primary"/> : null}
           {tipoGrafico === 'MULTILINE' ? <Activity size={16} className="text-primary"/> : null}
           Análisis Dinámico
        </h3>
        <div className="flex gap-2">
          {!showSettings && (
            <BotonExportarMetricas onPDF={exportarPDF} onPNG={exportarPNG} textoBoton="Exportar gráfico" />
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-md transition-colors">
            <Settings2 size={16} />
          </button>
          <button onClick={() => onRemove(id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Panel de Configuración Colapsable */}
      {showSettings ? (
        <div className="bg-secondary/50 p-4 border-b border-border grid grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
          
          <div className="flex flex-col gap-1">
            <label className="font-medium text-muted-foreground">Tipo de Gráfico</label>
            <select 
              value={tipoGrafico} 
              onChange={(e) => {
                const tipo = e.target.value as ChartType;
                setTipoGrafico(tipo);
                if (tipo === "MULTILINE") setAgruparPor(Agrupacion.FECHA);
              }} 
              className="p-1.5 rounded-md border border-border bg-card"
            >
              <option value="LINE">Líneas (Evolución)</option>
              <option value="MULTILINE">Multilíneas (Comparativa)</option>
              <option value="BAR">Barras (Comparación)</option>
              <option value="PIE">Circular (Distribución)</option>
              <option value="KPI">Tarjeta (Resumen)</option>
            </select>
          </div>

          {tipoGrafico === "MULTILINE" ? (
            <div className="flex flex-col gap-1">
              <label className="font-medium text-muted-foreground">Comparar por (Líneas)</label>
              <select 
                value={compararPor} 
                onChange={(e) => setCompararPor(e.target.value as ComparativaMode)} 
                className="p-1.5 rounded-md border border-border bg-card"
              >
                <option value="COMISION">Comisiones</option>
                <option value="LOCALIDAD">Sedes (Localidades)</option>
              </select>
            </div>
          ) : null}

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
            <select 
              value={agruparPor} 
              onChange={(e) => setAgruparPor(e.target.value as Agrupacion)} 
              className="p-1.5 rounded-md border border-border bg-card disabled:opacity-50"
              disabled={tipoGrafico === "MULTILINE"}
              title={tipoGrafico === "MULTILINE" ? "En multilíneas el eje X siempre es la fecha" : ""}
            >
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

          {/* {showFiltroLocalidadGlobal ? (
            <div className="flex flex-col gap-1">
              <label className="font-medium text-muted-foreground">Localidad (Opcional)</label>
              <select 
                value={localidad} 
                onChange={(e) => setLocalidad(e.target.value)} 
                className="p-1.5 rounded-md border border-border bg-card text-foreground"
              >
                <option value="">Todas las localidades</option>
                {localidadesDisponibles.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          ) : null} */}
          
          {showMotivoBajaSelect ? (
             <div className="flex flex-col gap-1">
               <label className="font-medium text-muted-foreground">Motivo Específico</label>
               <select value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value as MotivoBaja)} className="p-1.5 rounded-md border border-border bg-card">
                 <option value="">Todos los motivos</option>
                 {Object.values(MotivoBaja).map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
               </select>
             </div>
          ) : null}

           {showTipoAsistenciaSelect ? (
             <div className="flex flex-col gap-1 xl:col-span-2">
               <label className="font-medium text-muted-foreground">Filtrar por Tipo de Asistencia</label>
               <select value={tipoDeAsistencia} onChange={(e) => setTipoDeAsistencia(e.target.value as TipoDeAsistencia)} className="p-1.5 rounded-md border border-border bg-card">
                 <option value="">Todos los tipos</option>
                 {Object.values(TipoDeAsistencia).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
               </select>
             </div>
          ) : null}
        </div>
      ) : null}

      {/* Renderizado del Gráfico */}
      <div ref={refWidget} className="flex-1 p-4 pb-8 min-h-0">
        {renderChart()}
      </div>
    </div>
  );
}