import { useEffect, useState } from "react";
import { commissions, calendarEvents } from "@/data/mockData";
import ComisionCard from "@/components/ComisionCard";
import CalendarPanel from "@/components/CalendarPanel";
import CommissionDetail from "@/components/ComisionDetalle";
import { Comision } from "@/types/comisionType";
import { obtenerComisionesDelTutor } from "@/service/apiComision";
import { useParams, useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";
import StudentDashboard from "@/pages/EstudianteDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import { Tutor } from "@/types/tutorType";
import { Role } from "@/data/types";
import { obtenerTodosLosEstudiantes } from "@/service/apiEstudiante";
import { Estudiante } from "@/types/estudianteType";
import EstudianteDashboard from "@/pages/EstudianteDashboard";
import ComisionDetalle from "@/components/ComisionDetalle";

const userNames: Record<Role, string> = {
  estudiante: "Lucía Martínez",
  tutor: "María González",
  admin: "Admin TVU",
};

export default function TutorDashboard() {
  const { id } = useParams<{ id: string }>();
  const tutorId = id;
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("tutor");
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStudentCalendar, setShowStudentCalendar] = useState(false);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [comisionSeleccionada, setComisionSeleccionada] = useState<Comision | null>(null);
  const [comisiones, setComisiones] = useState<Comision[]>([]);

  const tutorEvents = calendarEvents.filter((e) =>
    commissions.some((c) => c.id === e.commissionId),
  );

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
    if (newRole !== "tutor") navigate("/");
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
    fetchTutores();
  }, []);

  useEffect(() => {
    const fetchComisiones = async () => {
      try {
        const response = await obtenerComisionesDelTutor(String(tutorId));
        setComisiones(response.data);
      } catch (error) {
        console.error("Error loading commissions:", error);
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
    fetchEstudiantes();
    fetchComisiones();
  }, [tutorId]);

  const renderContent = () => {
    if (role === "admin") return <AdminDashboard />;

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
            <h1 className="text-xl font-bold text-foreground">
              Mis comisiones
            </h1>
            <p className="text-sm text-muted-foreground">
              {comisiones.length} comisiones asignadas
            </p>
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
