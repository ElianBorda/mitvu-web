import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { attendanceByCommission, getCommissionAvgAttendance } from "@/data/mockData";
import DataTable from "@/components/DataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Comision } from "@/types/comisionType";

type AdminView = "comisiones" | "tutores" | "estudiantes";

export default function AdminDashboard() {
  const [view, setView] = useState<AdminView>("comisiones");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [tutores, setTutores] = useState<any[]>([]);
  const [comisiones, setComisiones] = useState<Comision[]>([]);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "estudiantes") {
      setView("estudiantes");
      setSearchParams({}, { replace: true });
    } else if (viewParam === "commissions") {
      setView("comisiones");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchEstudiantes = async () => {

      try {
        const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/estudiantes`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

        if (!res.ok) {
          const html = await res.text();
          throw new Error("Error HTTP: " + res.status + "\n" + html);
        }

        const data = await res.json();
        setEstudiantes(data);
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
      }
    };

    const fetchTutores = async () => {
      try {
        const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tutores`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) {
          const html = await res.text();
          throw new Error("Error HTTP: " + res.status + "\n" + html);
        }

        const data = await res.json();
        setTutores(data);
      } catch (error) {
        console.error("Error al obtener tutores:", error);
      }

      
    };

    const fetchComisiones = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/comisiones`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.ok) {
          const html = await res.text();
          throw new Error("Error HTTP: " + res.status + "\n" + html);
        }
        const data = await res.json();
        setComisiones(data);
      } catch (error) {
        console.error("Error al obtener comisiones:", error);
      }
    };
    
    fetchComisiones();
    fetchEstudiantes();
    fetchTutores();
  }, []);

  const asignarComision = async (estudianteId: number, comisionId: string) => {
    console.log(`Asignar estudiante ${estudianteId} a comisión ${comisionId}`);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/estudiantes/${estudianteId}/asignar-comision/${comisionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estudianteId, comisionId }),
        }
      );
      if (!res.ok) {
        const html = await res.text();
        throw new Error("Error HTTP: " + res.status + "\n" + html);
      }
      const data = await res.json();
      setEstudiantes((prev) => prev.map(e => e.id === estudianteId ? { ...e, comision_id: comisionId } : e));
    } catch (error) {
      console.error("Error al asignar comisión:", error);
    }
  };

  const totalEstudiantes = estudiantes.length;
  const avgGlobal = Math.round(
    comisiones.reduce((s, c) => s + getCommissionAvgAttendance(c.id), 0) / comisiones.length
  );

  const barData = comisiones.map(c => ({
    name: 'comision',
    asistencia: 'No definido',
  }));

  const lineData = Array.from({ length: 6 }, (_, i) => ({
    name: `Enc. ${i + 1}`,
    asistencia: Math.round(
      comisiones.reduce((s, c) => s + (attendanceByCommission[c.id]?.[i]?.percentage || 0), 0) / comisiones.length
    ),
  }));

  const localityData = Object.entries(
    estudiantes.reduce<Record<string, number>>((acc, s) => {
      const comm = comisiones.find(c => c.id === s.comisionId);
      const loc = comm?.localidad || "Otro";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const PIE_COLORS = ["hsl(350,82%,27%)", "hsl(350,82%,45%)", "hsl(350,82%,60%)", "hsl(0,0%,80%)"];

  const comisionData = comisiones.map(c => {
    const t = tutores.find(tt => tt.id === c.tutor.id);
    return {
      id: c.id,
      numero: c.numero,
      localidad: c.localidad,
      departamento: c.departamento,
      turno: c.turno,
      tutor: t ? `${t.apellido}, ${t.nombre}` : "No definido",
      // estudiantes: c.estudianteIds.length,
      // asistencia: `${getCommissionAvgAttendance(c.id)}%`,
    };
  });

  const tutorData = tutores.map(t => ({
    apellido: t.apellido,
    nombre: t.nombre,
    mail: t.mail,
    // horario: t.preferredSchedule,
    // localidad: t.locality,
    comisiones: t.comisiones_ids.length,
  }));

  const estudianteData = estudiantes.map(e => {
    const com = comisiones.find(c => c.id === e.comision_id);
    // const pres = s.attendance.filter(a => a === "present").length;
    // const total = s.attendance.filter(a => a !== "none").length;
    return {
      apellido: e.apellido,
      nombre: e.nombre,
      dni: e.dni,
      carrera: e.carrera,
      comision: (
  <div className="flex items-center gap-2">
    {com ? (
  <span>Comisión {com.numero} - {com.departamento} - {com.localidad}</span>
) : (

    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90"
        >
          Asignar +
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-1 max-h-60 overflow-y-auto"
        align="start"
      >
        {comisiones.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground text-center">
            No hay comisiones disponibles
          </div>
        ) : (
          <>
            <div className="px-2 py-1 text-xs text-muted-foreground">
              Seleccionar comisión
            </div>

            {comisiones.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  asignarComision(e.id, c.id);
                }}
                className="w-full text-left px-2 py-2 rounded text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Comisión {c.numero} - {c.departamento} - {c.localidad} - {c.horarioInicio}
              </button>
            ))}
          </>
        )}
      </PopoverContent>
    </Popover>
)}
  </div>
)
      // estado: total > 0 ? `${Math.round((pres / total) * 100)}%` : "—",
    };
  });

  const tableConfigs: Record<AdminView, { columns: { key: string; label: string }[]; data: Record<string, any>[]; addLabel: string }> = {
    comisiones: {
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "localidad", label: "Localidad" },
        { key: "departamento", label: "Departamento" },
        { key: "turno", label: "Turno" },
        { key: "tutor", label: "Tutor/a" },
        { key: "estudiantes", label: "Estudiantes" },
        { key: "asistencia", label: "Asistencia %" },
      ],
      data: comisionData,
      addLabel: "Agregar comisión",
    },
    tutores: {
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
    estudiantes: {
      columns: [
        { key: "apellido", label: "Apellido" },
        { key: "nombre", label: "Nombre" },
        { key: "dni", label: "DNI" },
        { key: "carrera", label: "Carrera" },
        { key: "comision", label: "Comisión" },
        { key: "estado", label: "Estado" },
      ],
      data: estudianteData,
      addLabel: "Agregar estudiante",
    },
  };

  const config = tableConfigs[view];
  const tabs: { id: AdminView; label: string }[] = [
    { id: "comisiones", label: "Comisiones" },
    { id: "tutores", label: "Tutores" },
    { id: "estudiantes", label: "Estudiantes" },
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
            if (view === "estudiantes") {
              navigate("/admin/agregar-estudiante");
            }
            if (view === "tutores") {
              navigate("/admin/agregar-tutor");
            }
            if (view === "comisiones") {
              navigate("/admin/agregar-comision");
            }
          }}
          addLabel={config.addLabel}
          onEdit={(row) => {
            if (view === "comisiones" && row.id) navigate(`/admin/editar-comision/${row.id}`);
          }}

        />
      </div>

      {/* Right: Metrics */}
      <div className="w-full xl:w-80 shrink-0 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Métricas generales</h2>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-lg shadow-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalEstudiantes}</p>
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
