import { useEffect, useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import ComisionDetalle from "@/components/ComisionDetalle";
import { format } from "date-fns";
import { Comision } from "@/types/comisionType";
import { obtenerComisionesDelEstudiante } from "@/service/apiComision";
import { asignarTokenAEstudiante, estaDadoDeBaja } from "@/service/apiEstudiante";
import { isAxiosError } from "axios";
import { useLayoutContext } from "@/App";
import { toast } from "sonner";
import { escucharMensajesForeground, solicitarTokenFCM } from "@/firebase";
import { Bell } from "lucide-react";
import { guardarNotificacion, obtenerNotificacionesPorUsuario } from "@/service/apiNotificacion";

export default function EstudianteDashboard({
  unenrolled = false,
}: {
  unenrolled?: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const { role, isCalendarOpen, setCalendarOpen, setNotificaciones } = useLayoutContext();
  const navigate = useNavigate();

  const [comision, setComision] = useState<Comision | null>(null);
  const [dadoDeBaja, setDadoDeBaja] = useState(false);
  const [hasNoComision, setHasNoComision] = useState(false);
  const [loading, setLoading] = useState(true);

  const eventosDelEstudiante = []; //Se consiguen los eventos del tutor (en un principio son eventos globables)

 useEffect(() => {
    const cargarHistorial = async () => {
      if (!id) return;
      try {
        const response = await obtenerNotificacionesPorUsuario(id);
        
        const historialMapeado = response.data.map((n: any) => ({
          id: n.id || Math.random().toString(),
          titulo: n.titulo,
          descripcion: n.cuerpo,
          fecha: n.fecha,
          read: n.leida,        
        }));

        setNotificaciones(historialMapeado.reverse());
        
      } catch (error) {
        console.error("Error al cargar el historial de notificaciones:", error);
      }
    };

    cargarHistorial();

    const inicializarNotificaciones = async () => {
      const token = await solicitarTokenFCM();
      
      if (token) {
        console.log("Token listo para enviar al backend:", token);
        if (role === "estudiante") {
          asignarTokenAEstudiante(id, token)
        }
      }
    };

    inicializarNotificaciones();
    
    escucharMensajesForeground((payload) => {
      const fechaParaBackend = format(new Date(), "dd-MM-yyyy HH:mm");

      const nuevaNotificacion = {
        id: payload.messageId || Date.now().toString(),
        idUsuario: id,
        titulo: payload.notification?.title || "Nueva Notificación",
        descripcion: payload.notification?.body || "",
        fecha: fechaParaBackend,
        read: false,
      };

      setNotificaciones((prev) => [nuevaNotificacion, ...prev]);

      toast(nuevaNotificacion.titulo, {
        description: nuevaNotificacion.descripcion,
        icon: <Bell className="text-primary" size={20} />,
        className: "border-l-4 border-l-primary bg-card text-foreground shadow-lg",
        duration: 6000, 
      });
    });
  }, [id, role, setNotificaciones]);

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
    <div className="relative w-full max-w-7xl mx-auto space-y-6">
      <ComisionDetalle comision={comision} role="estudiante" />
      
      {/* Botón de Feedback Anónimo (Solo si la comisión tiene un tutor asignado) */}
      {comision?.tutor?.id && (
        <div className="bg-card border border-border rounded-xl shadow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquareHeart className="text-primary" size={20} />
              Evaluá tu experiencia
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tu opinión nos ayuda a mejorar. Completá una breve encuesta anónima sobre tu comisión y tutor/a.
            </p>
          </div>
          <button
            onClick={() => navigate(`/estudiante/feedback/${comision.id}/${comision.tutor?.id}`)}
            className="shrink-0 px-6 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 border border-border transition-colors"
          >
            Dar Feedback Anónimo
          </button>
        </div>
      )}
    </div>
  );
}
