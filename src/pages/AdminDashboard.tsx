import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { commissions, tutors, students, attendanceByCommission, getCommissionAvgAttendance } from "@/data/mockData";
import DataTable from "@/components/DataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

type AdminView = "commissions" | "tutors" | "students";

export default function AdminDashboard() {
  const [view, setView] = useState<AdminView>("commissions");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "students") {
      setView("students");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const totalStudents = students.length;
  const avgGlobal = Math.round(
    commissions.reduce((s, c) => s + getCommissionAvgAttendance(c.id), 0) / commissions.length
  );

  const barData = commissions.map(c => ({
    name: c.name,
    asistencia: getCommissionAvgAttendance(c.id),
  }));

  const lineData = Array.from({ length: 6 }, (_, i) => ({
    name: `Enc. ${i + 1}`,
    asistencia: Math.round(
      commissions.reduce((s, c) => s + (attendanceByCommission[c.id]?.[i]?.percentage || 0), 0) / commissions.length
    ),
  }));

  const localityData = Object.entries(
    students.reduce<Record<string, number>>((acc, s) => {
      const comm = commissions.find(c => c.id === s.commissionId);
      const loc = comm?.locality || "Otro";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const PIE_COLORS = ["hsl(350,82%,27%)", "hsl(350,82%,45%)", "hsl(350,82%,60%)", "hsl(0,0%,80%)"];

  const commissionData = commissions.map(c => {
    const t = tutors.find(tt => tt.id === c.tutorId);
    return {
      nombre: c.name,
      localidad: c.locality,
      departamento: c.department,
      horario: c.schedule,
      tutor: t ? `${t.lastName}, ${t.firstName}` : "—",
      estudiantes: c.studentIds.length,
      asistencia: `${getCommissionAvgAttendance(c.id)}%`,
    };
  });

  const tutorData = tutors.map(t => ({
    apellido: t.lastName,
    nombre: t.firstName,
    mail: t.email,
    horario: t.preferredSchedule,
    localidad: t.locality,
    comisiones: t.commissionIds.length,
  }));

  const studentData = students.map(s => {
    const comm = commissions.find(c => c.id === s.commissionId);
    const pres = s.attendance.filter(a => a === "present").length;
    const total = s.attendance.filter(a => a !== "none").length;
    return {
      apellido: s.lastName,
      nombre: s.firstName,
      dni: s.dni,
      carrera: s.career,
      comision: comm?.name || "—",
      estado: total > 0 ? `${Math.round((pres / total) * 100)}%` : "—",
    };
  });

  const tableConfigs: Record<AdminView, { columns: { key: string; label: string }[]; data: Record<string, any>[]; addLabel: string }> = {
    commissions: {
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "localidad", label: "Localidad" },
        { key: "departamento", label: "Departamento" },
        { key: "horario", label: "Horario" },
        { key: "tutor", label: "Tutor/a" },
        { key: "estudiantes", label: "Estudiantes" },
        { key: "asistencia", label: "Asistencia %" },
      ],
      data: commissionData,
      addLabel: "Agregar comisión",
    },
    tutors: {
      columns: [
        { key: "apellido", label: "Apellido" },
        { key: "nombre", label: "Nombre" },
        { key: "mail", label: "Mail" },
        { key: "horario", label: "Horario pref." },
        { key: "localidad", label: "Localidad" },
        { key: "comisiones", label: "Comisiones" },
      ],
      data: tutorData,
      addLabel: "Agregar tutor",
    },
    students: {
      columns: [
        { key: "apellido", label: "Apellido" },
        { key: "nombre", label: "Nombre" },
        { key: "dni", label: "DNI" },
        { key: "carrera", label: "Carrera" },
        { key: "comision", label: "Comisión" },
        { key: "estado", label: "Estado" },
      ],
      data: studentData,
      addLabel: "Agregar estudiante",
    },
  };

  const config = tableConfigs[view];
  const tabs: { id: AdminView; label: string }[] = [
    { id: "commissions", label: "Comisiones" },
    { id: "tutors", label: "Tutores" },
    { id: "students", label: "Estudiantes" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left: Table */}
      <div className="flex-1 min-w-0">
        {/* Tab pills */}
        <div className="flex gap-1 mb-4 bg-secondary rounded-lg p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                view === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DataTable
          columns={config.columns}
          data={config.data}
          onAdd={() => {
            if (view === "students") {
              navigate("/admin/add-student");
            }
          }}
          addLabel={config.addLabel}
        />
      </div>

      {/* Right: Metrics */}
      <div className="w-full xl:w-80 shrink-0 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Métricas generales</h2>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-lg shadow-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Total estudiantes</p>
          </div>
          <div className="bg-card rounded-lg shadow-card border border-border p-4 text-center">
            <p className={`text-2xl font-bold ${avgGlobal >= 70 ? "text-green-600" : "text-destructive"}`}>{avgGlobal}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">Asistencia promedio</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Asistencia por comisión</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="asistencia" fill="hsl(350,82%,27%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Evolución global</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Line type="monotone" dataKey="asistencia" stroke="hsl(350,82%,27%)" strokeWidth={2} dot={{ fill: "hsl(350,82%,27%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Estudiantes por localidad</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={localityData} cx="50%" cy="50%" outerRadius={60} dataKey="value" strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {localityData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
