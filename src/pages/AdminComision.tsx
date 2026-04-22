import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ComisionDetalle from "@/components/ComisionDetalle";
import { Comision } from "@/types/comisionType";
import { getObtenerComision } from "@/service/apiComision";
import { Role } from "@/data/types";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import { obtenerTodosLosEstudiantes } from "@/service/apiEstudiante";
import { Tutor } from "@/types/tutorType";
import { Estudiante } from "@/types/estudianteType";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";

export default function AdminComision() {
  const { id } = useParams<{ id: string }>();
  const comisionId = id;
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("admin");

  const [comision, setComision] = useState<Comision | null>(null);
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStudentCalendar, setShowStudentCalendar] = useState(false);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  const userNames: Record<Role, string> = {
    estudiante: "Lucía Martínez",
    tutor: "María González",
    admin: "Admin TVU",
  };

  const handleSidebarClick = (itemId: string) => {
    setActiveItem(itemId);
    if (role === "estudiante" && itemId === "calendar") {
      setShowStudentCalendar((prev) => !prev);
    }
    if (itemId === "redes") {
      window.open("https://www.unq.edu.ar", "_blank");
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setActiveItem("home");
    setShowStudentCalendar(false);
    if (newRole !== "estudiante") navigate("/");
  };

  const handleTutorSelect = (selectedTutorId: number) => {
    navigate(`/tutor/${selectedTutorId}`);
  };

  const handleEstudianteSelect = (selectedEstudianteId: number) => {
    navigate(`/estudiante/${selectedEstudianteId}`);
  };

  useEffect(() => {
    const fetchTutores = async () => {
      try {
        const response = await obtenerTodosLosTutores();
        setTutores(response.data);
      } catch (error) {
        console.error("Error fetching tutores:", error);
      }
    };
    const fetchEstudiantes = async () => {
      try {
        const response = await obtenerTodosLosEstudiantes();
        setEstudiantes(response.data);
      } catch (error) {
        console.error("Error fetching estudiantes:", error);
      }
    };
    fetchTutores();
    fetchEstudiantes();
  }, []);

  useEffect(() => {
    const fetchComision = async () => {
      setLoading(true);
      try {
        const response = await getObtenerComision(comisionId);
        setComision(response.data);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400) {
          setComision(null);
        } else {
          console.error("Error fetching comision:", error);
        }
      } finally {
        setLoading(false); // ← se ejecuta tanto si hay error como si no
      }
    };
    fetchComision();
  }, [comisionId]);

  const renderContent = () => {
    if (role === "tutor") return null;
    if (loading) {
      return (
        <p className="text-muted-foreground text-sm">Cargando comisión...</p>
      );
    }

    return (
      <div>
        <button
          onClick={() => navigate("/?view=comisiones")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </button>
        <ComisionDetalle comision={comision} role={role} />;
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        role={role}
        activeItem={activeItem}
        onItemClick={handleSidebarClick}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          userName={userNames[role]}
          role={role}
          onRoleChange={handleRoleChange}
          onMenuClick={() => setMobileMenuOpen(true)}
          tutores={tutores}
          onTutorSelect={handleTutorSelect}
          estudiantes={estudiantes}
          onEstudianteSelect={handleEstudianteSelect}
        />
        <main className="flex-1 p-3 sm:p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
