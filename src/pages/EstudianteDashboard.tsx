import { useEffect, useState } from "react";
import { calendarEvents } from "@/data/mockData";
import SlidePanel from "@/components/SlidePanel";
import CalendarPanel from "@/components/CalendarPanel";
import { useParams } from "react-router-dom";
import ComisionDetalle from "@/components/ComisionDetalle";
import { Comision } from "@/types/comisionType";
import { obtenerComisionesDelEstudiante } from "@/service/apiComision";
import { estaDadoDeBaja } from "@/service/apiEstudiante";
import { isAxiosError } from "axios";
import { useLayoutContext } from "@/App";
import { toast } from "sonner";

export default function EstudianteDashboard({
  unenrolled = false,
}: {
  unenrolled?: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const { role, isCalendarOpen, setCalendarOpen } = useLayoutContext();

  const [comision, setComision] = useState<Comision | null>(null);
  const [dadoDeBaja, setDadoDeBaja] = useState(false);
  const [hasNoComision, setHasNoComision] = useState(false);
  const [loading, setLoading] = useState(true);

  // reemplazar con API a futuro
  const studentEvents = calendarEvents.filter((e) => e.commissionId === "c1");

  useEffect(() => {
    const fetchComision = async () => {
      setLoading(true);
      setHasNoComision(false);
      try {
        const response = await obtenerComisionesDelEstudiante(String(id));
        setComision(response.data);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400) {
          setHasNoComision(true);
          setComision(null);
        } else {
          console.error("Error fetching comision:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    var dadoDeBaja: boolean;
    const checkDadoDeBaja = async () => {
      try {
        const response = await estaDadoDeBaja(String(id));
        setDadoDeBaja(response.data);
        dadoDeBaja = response.data;
        console.log("Dado de baja status:", response.data);
      } catch (error) {
        toast.error("Error checking dado de baja status");
        console.error("Error checking dado de baja status:", error);
      }
    };

    // Si hay id lo busca, sino asume carga resuelta
    // (ej. cuando se entra a Index sin parámetros en URL)
    checkDadoDeBaja();
    if (id && !dadoDeBaja) {
      fetchComision();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (role === "tutor" || role === "admin") return null;

  if (loading)
    return (
      <p className="text-muted-foreground text-sm">Cargando comisión...</p>
    );

  if (dadoDeBaja) {
    return (
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-card border border-border rounded-xl shadow-card px-8 py-12 max-w-lg w-full text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Te diste de baja del taller
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Ya no estás inscripto en ninguna comisión.
            </p>
          </div>
        </div>
      </div>
    );
  } else if (hasNoComision || unenrolled) {
    return (
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-card border border-border rounded-xl shadow-card px-8 py-12 max-w-lg w-full text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              {hasNoComision && "Aún no perteneces a ninguna comisión"}
              {unenrolled && "Te diste de baja del taller"}
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              {hasNoComision &&
                "Si este campo persiste, contactate con un tutor/administrador para realizar la inscripción."}
              {unenrolled && "Ya no estás inscripto en ninguna comisión."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <ComisionDetalle comision={comision} role="estudiante" />
      <SlidePanel
        open={isCalendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="Calendario académico"
      >
        <CalendarPanel events={studentEvents} />
      </SlidePanel>
    </div>
  );
}
