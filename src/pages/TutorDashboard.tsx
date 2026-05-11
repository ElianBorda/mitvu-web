import { useEffect, useState } from "react";
import ComisionCard from "@/components/ComisionCard";
import { Comision } from "@/types/comisionType";
import { obtenerComisionesDelTutor } from "@/service/apiComision";
import { useNavigate, useParams } from "react-router-dom";
import ComisionDetalle from "@/components/ComisionDetalle";
import { useLayoutContext } from "@/App";
import { Evento } from "@/types/eventoType";
import { obtenerTodosLosEventos } from "@/service/apiEvento";
import { toast } from "sonner";
import PanelCalendarioRead from "@/components/PanelCalendarioRead";

export default function TutorDashboard() {
  const { id } = useParams<{ id: string }>();
  const { role } = useLayoutContext();
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const navigate = useNavigate();

  const [eventosDelTutor, setEventosDelTutor] = useState<Evento[]>([]); //Se consiguen los eventos del tutor (en un principio son eventos globables)

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await obtenerTodosLosEventos();
        setEventosDelTutor(response.data);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
        toast.error("Error al obtener eventos");
      }
    };

    const fetchComisiones = async () => {
      try {
        const response = await obtenerComisionesDelTutor(String(id));
        setComisiones(response.data);
      } catch (error) {
        console.error("Error loading commissions:", error);
      }
    };
    if (id) fetchComisiones();
    fetchEventos();
  }, [id]);

  if (role === "admin" || role === "estudiante") return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">Mis comisiones</h1>
          <p className="text-sm text-muted-foreground">
            {comisiones.length} comisiones asignadas
          </p>
        </div>
        <div className="space-y-4">
          {comisiones.map((c) => (
            <ComisionCard
              key={c.id}
              comision={c}
              onClick={() => navigate(`/comision/${c.id}`)}
            />
          ))}
        </div>
      </div>
      <div className="w-full lg:w-80 shrink-0 pt-16">
        <PanelCalendarioRead eventos={eventosDelTutor}/>
      </div>
    </div>
  );
}
