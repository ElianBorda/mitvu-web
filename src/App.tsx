import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Role } from "@/data/types";
import { Tutor } from "@/types/tutorType";
import { Estudiante } from "@/types/estudianteType";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import { obtenerTodosLosEstudiantes } from "@/service/apiEstudiante";

import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";

const Index = lazy(() => import("./pages/Index.tsx"));
const AgregarEstudiante = lazy(() => import("./pages/AgregarEstudiante.tsx"));
const AgregarTutor = lazy(() => import("./pages/AgregarTutor.tsx"));
const AgregarComision = lazy(() => import("./pages/AgregarComision.tsx"));
const AdminComision = lazy(() => import("./pages/AdminComision.tsx"));
const TutorDashboard = lazy(() => import("./pages/TutorDashboard.tsx"));
const EstudianteDashboard = lazy(() => import("./pages/EstudianteDashboard.tsx"));
const PaginaDarDeBaja = lazy(() => import("./pages/PaginaDarDeBaja.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const userNames: Record<Role, string> = {
  estudiante: "Lucía Martínez",
  tutor: "María González",
  admin: "Admin TVU",
};

export type LayoutContextType = {
  role: Role;
  isCalendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useLayoutContext() {
  return useOutletContext<LayoutContextType>();
}

const RootLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [role, setRole] = useState<Role>("admin");
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  
  // 1. Convertimos la validación en un Estado de React
  const [studentUnenrolled, setStudentUnenrolled] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("studentUnenrolled") === "true"
  );

  useEffect(() => {
    obtenerTodosLosTutores().then(res => setTutores(res.data)).catch(console.error);
    obtenerTodosLosEstudiantes().then(res => setEstudiantes(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (location.pathname.includes('/estudiante')) setRole('estudiante');
    else if (location.pathname.includes('/tutor')) setRole('tutor');
    else setRole('admin');

    // 2. Cada vez que cambia la URL, verificamos el estado real del storage
    setStudentUnenrolled(localStorage.getItem("studentUnenrolled") === "true");
  }, [location.pathname]);

  const handleSidebarClick = (sidebarId: string) => {
    setActiveItem(sidebarId);

    if (sidebarId === "baja" && role === "estudiante") {
      const pathSegments = location.pathname.split('/');
      const currentId = pathSegments[2]; 

      if (currentId) navigate(`/estudiante/baja/${currentId}`);
      else navigate('/estudiante/baja'); 
      return;
    }

    if (sidebarId === "calendar") setCalendarOpen(prev => !prev);
    if (sidebarId === "redes") window.open("https://www.unq.edu.ar", "_blank");
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        role={role}
        activeItem={activeItem}
        onItemClick={handleSidebarClick}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        // 3. Pasamos el estado reactivo al Sidebar
        hideStudentUnenroll={studentUnenrolled}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          userName={userNames[role]}
          role={role}
          onRoleChange={(newRole) => {
            setRole(newRole);
            navigate("/");
          }}
          onMenuClick={() => setMobileMenuOpen(true)}
          tutores={tutores}
          onTutorSelect={(id) => navigate(`/tutor/${id}`)}
          estudiantes={estudiantes}
          onEstudianteSelect={(id) => {
            // 4. FIX CLAVE: Al seleccionar un estudiante, borramos la baja anterior 
            // de pruebas pasadas para que el botón siempre aparezca.
            localStorage.removeItem("studentUnenrolled");
            setStudentUnenrolled(false);
            setRole("estudiante");
            navigate(`/estudiante/${id}`);
          }}
        />
        <main className="flex-1 p-3 sm:p-6">
          <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando...</p>}>
            <Outlet context={{ role, isCalendarOpen, setCalendarOpen }} />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { path: "admin/agregar-estudiante", element: <AgregarEstudiante /> },
      { path: "admin/agregar-tutor", element: <AgregarTutor /> },
      { path: "admin/agregar-comision", element: <AgregarComision /> },
      { path: "admin/editar-comision/:id", element: <AgregarComision /> },
      { path: "admin/comision/:id", element: <AdminComision /> },
      { path: "tutor/:id", element: <TutorDashboard /> },
      { path: "estudiante/:id", element: <EstudianteDashboard /> },
      // Actualizamos la ruta para que acepte el ID opcional o fijo
      { path: "estudiante/baja/:id", element: <PaginaDarDeBaja /> },
      { path: "estudiante/baja", element: <PaginaDarDeBaja /> }, 
      { path: "*", element: <NotFound /> }
    ]
  }
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;