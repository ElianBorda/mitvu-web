import { useEffect, useState } from "react";
import { commissions, calendarEvents } from "@/data/mockData";
import ComisionCard from "@/components/ComisionCard";
import CalendarPanel from "@/components/CalendarPanel";
import { Comision } from "@/types/comisionType";
import { obtenerComisionesDelTutor } from "@/service/apiComision";
import { useParams } from "react-router-dom";
import ComisionDetalle from "@/components/ComisionDetalle";
import { useLayoutContext } from "@/App";

export default function TutorDashboard() {
  const { id } = useParams<{ id: string }>();
  const { role } = useLayoutContext();
  
  const [comisionSeleccionada, setComisionSeleccionada] = useState<Comision | null>(null);
  const [comisiones, setComisiones] = useState<Comision[]>([]);

  const tutorEvents = calendarEvents.filter((e) =>
    commissions.some((c) => c.id === e.commissionId),
  );

  useEffect(() => {
    const fetchComisiones = async () => {
      try {
        const response = await obtenerComisionesDelTutor(String(id));
        setComisiones(response.data);
      } catch (error) {
        console.error("Error loading commissions:", error);
      }
    };
    if (id) fetchComisiones();
  }, [id]);

  if (role === "admin" || role === "estudiante") return null;

  if (comisionSeleccionada) {
    return (
      <ComisionDetalle
        comision={comisionSeleccionada}
        role="tutor"
        onBack={() => setComisionSeleccionada(null)}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">Mis comisiones</h1>
          <p className="text-sm text-muted-foreground">{comisiones.length} comisiones asignadas</p>
        </div>
        <div className="space-y-4">
          {comisiones.map((c) => (
            <ComisionCard
              key={c.id}
              comision={c}
              onClick={() => setComisionSeleccionada(c)}
            />
          ))}
        </div>
      </div>
      <div className="w-full lg:w-80 shrink-0">
        <CalendarPanel events={tutorEvents} onAddEvent={() => {}} />
      </div>
    </div>
  );
}