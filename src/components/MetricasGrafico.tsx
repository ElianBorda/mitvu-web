import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { obtenerMetricasDeBajaDeEstudiantes } from "@/service/apiMetrica"; 
import { toast } from "sonner";

const PIE_COLORS = ["#800000", "#16a34a"]; 

export default function MetricasGrafico() {
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   obtenerMetricasDeBajaDeEstudiantes()
    .then(({ data }) => {
      setChartData([
        { name: "Bajas", value: data.cantidadDeEstudiantesDadoDeBaja },
        { name: "Activos", value: data.cantidadDeEstudiantesActivos },
      ])
    })
    .catch((error) => toast.error("No se pudieron cargar las metricas"))
    .finally(() => setLoading(false))
  }, []);

  if (loading) {
    return <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">Cargando gráfico...</div>;
  }

  if (chartData.every(d => d.value === 0)) {
    return <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">Sin datos suficientes</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart margin={{ top: 10, right: 35, bottom: 10, left: 35 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={45} 
          dataKey="value"
          strokeWidth={0}
          labelLine={false}
          label={({ name, percent, x, y, textAnchor }) => {
            if (percent === 0) return null;
            return (
              <text
                x={x}
                y={y}
                fill={name === "Bajas" ? "#800000" : "#16a34a"} 
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize={13}
                fontWeight={500}
              >
                {`${name} ${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value} estudiantes`]} />
      </PieChart>
    </ResponsiveContainer>
  );
}