import { useEffect, useState } from "react";
import { Role } from "@/data/types";
import AppSidebar from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import Topbar from "@/components/Topbar";
import StudentDashboard from "@/pages/StudentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import { Tutor } from "@/types/TutorType";

const userNames: Record<Role, string> = {
  student: "Lucía Martínez",
  tutor: "María González",
  admin: "Admin TVU",
};

export default function Index() {
  const [role, setRole] = useState<Role>("admin");
  const [activeItem, setActiveItem] = useState("home");
  const [showStudentCalendar, setShowStudentCalendar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const navigate = useNavigate();

  const handleSidebarClick = (id: string) => {
    setActiveItem(id);
    if (role === "student" && id === "calendar") {
      setShowStudentCalendar(prev => !prev);
    }
    if (id === "redes") {
      window.open("https://www.unq.edu.ar", "_blank");
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setActiveItem("home");
    setShowStudentCalendar(false);
    if (newRole !== "tutor") navigate("/");
  };

  // Nueva función para navegar al tutor seleccionado
  const handleTutorSelect = (tutorId: number) => {
    navigate(`/tutor/${tutorId}`);
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

  const renderContent = () => {
    if (role === "student") {
      return (
        <StudentDashboard
          showCalendar={showStudentCalendar}
          onCloseCalendar={() => setShowStudentCalendar(false)}
        />
      );
    }
    if (role === "admin") return <AdminDashboard />;
    return null;
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
        />
        <main className="flex-1 p-3 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}