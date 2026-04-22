import { useEffect, useState } from "react";
import { calendarEvents } from "@/data/mockData";
import SlidePanel from "@/components/SlidePanel";
import CalendarPanel from "@/components/CalendarPanel";
import { useNavigate, useParams } from "react-router";
import ComisionDetalle from "@/components/ComisionDetalle";
import { Comision } from "@/types/comisionType";
import { obtenerComisionesDelEstudiante } from "@/service/apiComision";
import { Role } from "@/data/types";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";
import AdminDashboard from "@/pages/AdminDashboard";
import TutorDashboard from "@/pages/TutorDashboard";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import { obtenerTodosLosEstudiantes } from "@/service/apiEstudiante";
import { Tutor } from "@/types/tutorType";
import { Estudiante } from "@/types/estudianteType";
import { isAxiosError } from "axios";

const userNames: Record<Role, string> = {
  estudiante: "Lucía Martínez",
  tutor: "María González",
  admin: "Admin TVU",
};

export default function EstudianteDashboard() {
  const { id } = useParams<{ id: string }>();
  const estudianteId = id;
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("estudiante");
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStudentCalendar, setShowStudentCalendar] = useState(false);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [comision, setComision] = useState<Comision | null>(null);
  const [hasNoComision, setHasNoComision] = useState(false);

  const [loading, setLoading] = useState(true);

  const studentEvents = calendarEvents.filter(e => e.commissionId === "c1"); // reemplazar con API

  const handleSidebarClick = (itemId: string) => {
    setActiveItem(itemId);
    if (role === "estudiante" && itemId === "calendar") {
      setShowStudentCalendar(prev => !prev);
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
    setHasNoComision(false);
    try {
      const response = await obtenerComisionesDelEstudiante(estudianteId);
      setComision(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        setHasNoComision(true);
        setComision(null);
      }
      else {
        console.error("Error fetching comision:", error);
      }
    } finally {
      setLoading(false); // ← se ejecuta tanto si hay error como si no
    }
  };
    fetchComision();
  }, [estudianteId]);

  const renderContent = () => {
    if (role === "tutor") return null; // handleRoleChange ya navega, esto no debería renderizarse
    if (role === "admin") return <AdminDashboard />;
    if (loading) {
       return <p className="text-muted-foreground text-sm">Cargando comisión...</p>;
    }
    if (hasNoComision) {
      return (
        <div className="inline-flex rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Aún no tenés una comisión asignada.
        </div>
      );
    }

    // Vista por defecto: dashboard del estudiante
    return (
      <div className="relative">
        <ComisionDetalle comision={comision} role="estudiante" />
        <SlidePanel
          open={showStudentCalendar}
          onClose={() => setShowStudentCalendar(false)}
          title="Calendario académico"
        >
          <CalendarPanel events={studentEvents} />
        </SlidePanel>
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
        <main className="flex-1 p-3 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}