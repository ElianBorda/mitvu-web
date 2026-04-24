import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Corregido el import de react-router a react-router-dom
import ComisionDetalle from "@/components/ComisionDetalle";
import { Comision } from "@/types/comisionType";
import { getObtenerComision } from "@/service/apiComision";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { useLayoutContext } from "@/App";

export default function AdminComision() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Consumimos el rol desde el layout centralizado
  const { role } = useLayoutContext();

  const [comision, setComision] = useState<Comision | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComision = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await getObtenerComision(id);
        setComision(response.data);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400) {
          setComision(null);
        } else {
          console.error("Error fetching comision:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchComision();
  }, [id]);

  // Si no es admin, no renderizamos el contenido (protección de ruta básica)
  if (role !== "admin") return null;

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Cargando comisión...</p>
    );
  }

  // Manejo de caso donde la comisión no existe o falló la carga
  if (!comision) {
     return (
        <div className="text-center mt-10">
           <p className="text-muted-foreground mb-4">No se encontró la comisión solicitada.</p>
           <button
            onClick={() => navigate("/?view=comisiones")}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Volver al panel
          </button>
        </div>
     );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <button
        onClick={() => navigate("/?view=comisiones")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al panel
      </button>
      
      {/* Eliminado el punto y coma (;) erróneo que estaba al final de este componente 
        y le pasamos explícitamente el rol de admin
      */}
      <ComisionDetalle comision={comision} role="admin" />
    </div>
  );
}