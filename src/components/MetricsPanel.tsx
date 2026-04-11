import { attendanceByCommission } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Props {
  commissionId: string;
  commissionNumber: number;
}

export default function MetricsPanel({ commissionId, commissionNumber }: Props) {
  const records = attendanceByCommission[commissionId] || [];
  const barData = records.map(r => ({ name: `Enc. ${r.encounter}`, asistencia: r.percentage }));

  const avgPresence = records.length > 0 ? Math.round(records.reduce((s, r) => s + r.percentage, 0) / records.length) : 0;
  const pieData = [
    { name: "Presentes", value: avgPresence },
    { name: "Ausentes", value: 100 - avgPresence },
  ];
  const COLORS = ["hsl(350, 82%, 27%)", "hsl(0, 0%, 90%)"];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Métricas de presencialidad — Comisión {commissionNumber}</h2>

      {/* Bar chart */}
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
      </div>

      {/* Pie chart */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Presencia total acumulada</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="ml-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-foreground">Presentes: {avgPresence}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-foreground">Ausentes: {100 - avgPresence}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
