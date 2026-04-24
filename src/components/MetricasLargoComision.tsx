import { useEffect, useState } from "react";
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
} from "recharts";
import { toast } from "sonner"; 
import { attendanceByCommission } from "@/data/mockData"; 
import { obtenerMetricasDeBajaDeEstudiantesDeComision } from "@/service/apiMetrica";

type Props = {
  comisionId: string;
  numeroComision: string | number;
};

export default function MetricasLargoComision({ comisionId, numeroComision }: Props) {
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [loadingPie, setLoadingPie] = useState(true);
  const records = attendanceByCommission[comisionId] || [];
  const barData = records.map(r => ({ name: `Enc. ${r.encounter}`, asistencia: r.percentage }));
  const COLORS = ["#800000", "#16a34a"];

  useEffect(() => {
      obtenerMetricasDeBajaDeEstudiantesDeComision(comisionId)
       .then(({ data }) => {
         setPieData([
           { name: "Bajas", value: data.cantidadDeEstudiantesDadoDeBaja },
           { name: "Activos", value: data.cantidadDeEstudiantesActivos },
         ])
       })
       .catch((error) => toast.error("No se pudieron cargar las metricas"))
       .finally(() => setLoadingPie(false))
  }, [comisionId]);
  const bajasCount = pieData.find(d => d.name === "Bajas")?.value || 0;
  const activosCount = pieData.find(d => d.name === "Activos")?.value || 0;

  return (
    <div className="space-y-6">
      {/* <h2 className="text-lg font-semibold text-foreground">
        Métricas de presencialidad — Comisión {numeroComision}
      </h2>

      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Asistencia por encuentro</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="asistencia" fill="hsl(350, 82%, 27%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div> */}

      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Estado de los estudiantes</h3>
        
        {loadingPie ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Cargando métricas...
          </div>
        ) : pieData.every(d => d.value === 0) ? (
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
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} estudiantes`]} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="ml-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                <span className="text-foreground font-medium">
                  Activos: {activosCount}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                <span className="text-foreground font-medium">
                  Bajas: {bajasCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}