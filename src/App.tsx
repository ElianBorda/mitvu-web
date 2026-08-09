import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useOutletContext,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Role } from "@/data/types";
import { Notificacion } from "@/types/notificacionType";

import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/context/ProtectedRoute";
import Login from "@/pages/Login";
import { Rol } from "@/types/authType";

const Index = lazy(() => import("./pages/Index.tsx"));
const AgregarEstudiante = lazy(() => import("./pages/AgregarEstudiante.tsx"));
const AgregarTutor = lazy(() => import("./pages/AgregarTutor.tsx"));
const AgregarComision = lazy(() => import("./pages/AgregarComision.tsx"));
const RolGestionComision = lazy(() => import("./pages/RolGestionComision.tsx"));
const TutorDashboard = lazy(() => import("./pages/TutorDashboard.tsx"));
const EstudianteDashboard = lazy(() => import("./pages/EstudianteDashboard.tsx"));
const PaginaDarDeBaja = lazy(() => import("./pages/PaginaDarDeBaja.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AgregarEvento = lazy(() => import("./pages/AgregarEvento.tsx"));
const AsistenciaComision = lazy(() => import("./pages/AsistenciaComision.tsx"));
const MetricasDashboard = lazy(() => import("./pages/MetricasDashboard.tsx"));
const FormularioEstudiante = lazy(() => import("./pages/FormularioEstudiante.tsx"));
const FormularioTutor = lazy(() => import("./pages/FormularioTutor.tsx"));
const FormularioFeedbackEstudiante = lazy(() => import("./pages/FormularioFeedbackEstudiante.tsx"));
const AdminFeedbackDashboard = lazy(() => import("./pages/AdminFeedbackDashboard.tsx"));
const AdminSolicitudesDashboard = lazy(() => import("./pages/AdminSolicitudesDashboard.tsx"));

const queryClient = new QueryClient();

export type LayoutContextType = {
  role: Role;
  isCalendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshPeople: () => void;
  setNotificaciones: React.Dispatch<React.SetStateAction<Notificacion[]>>;
  activeItem: string;
  setActiveItem: (id: string) => void;
  registerSidebarHandler: (id: string, handler: () => void) => void;
  unregisterSidebarHandler: (id: string) => void;
  adminActualId: string | null;
};

export function useLayoutContext() {
  return useOutletContext<LayoutContextType>();
}

const RootLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();

  const obtenerRoleLegacy = (rol: Rol | undefined): Role => {
    if (rol === Rol.ADMINISTRADOR) return "admin";
    if (rol === Rol.TUTOR) return "tutor";
    return "estudiante";
  };

  const role = obtenerRoleLegacy(user?.rol);
  const [activeItem, setActiveItem] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [previousActiveItemTable, setPreviousActiveItemTable] = useState<string | null>(activeItem || null);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [studentUnenrolled, setStudentUnenrolled] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("studentUnenrolled") === "true",
  );

  // Mantenemos la firma de refreshPeople vacía para no romper dependencias en otros componentes
  const refreshPeople = () => {}; 

  useEffect(() => {
    if (location.pathname.includes("/estudiante")) {
      setActiveItem("home");
    } else if (location.pathname.includes("/tutor")) {
      setActiveItem("comisiones");
    } else if (location.pathname.includes("/admin/feedback")) {
      setActiveItem("feedback");
    } else if (location.pathname.includes("/admin/metricas")) {
      setActiveItem("metricas");
    } else if (location.pathname.includes("/admin/solicitudes")) {
      setActiveItem("solicitudes");
    } else if (location.pathname === "/" || location.pathname.includes("/admin")) {
      setActiveItem(previousActiveItemTable || "comisiones");
    }
    setStudentUnenrolled(localStorage.getItem("studentUnenrolled") === "true");
  }, [location.pathname, previousActiveItemTable]);

  const [sidebarHandlers, setSidebarHandlers] = useState<Record<string, () => void>>({});

  const registerSidebarHandler = (id: string, handler: () => void) => {
    setSidebarHandlers((prev) => ({ ...prev, [id]: handler }));
  };

  const unregisterSidebarHandler = (id: string) => {
    setSidebarHandlers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSidebarClick = (sidebarId: string) => {
    setActiveItem(sidebarId);
    if (sidebarId !== "metricas") setPreviousActiveItemTable(sidebarId);
    if (sidebarHandlers[sidebarId]) {
      sidebarHandlers[sidebarId]();
      return;
    }
    if (sidebarId === "metricas") return navigate("/admin/metricas");
    if (sidebarId === "feedback") return navigate("/admin/feedback");
    if (sidebarId === "solicitudes") return navigate("/admin/solicitudes");
    if (sidebarId === "comisiones" || sidebarId === "estudiantes" || sidebarId === "tutores") {
      return navigate(`/?view=${sidebarId}`);
    }
    if (sidebarId === "baja" && role === "estudiante") {
      const currentId = location.pathname.split("/")[2];
      return navigate(currentId ? `/estudiante/baja/${currentId}` : "/estudiante/baja");
    }
    if (sidebarId === "calendario") setCalendarOpen((prev) => !prev);
    if (sidebarId === "redes") window.open("https://www.unq.edu.ar", "_blank");
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        role={role}
        activeItem={activeItem}
        onItemClick={handleSidebarClick}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        hideStudentUnenroll={studentUnenrolled}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar LIMPIO: ya no requiere pasar arrays de usuarios */}
        <Topbar
          userName={user ? `${user.nombre} ${user.apellido}` : "Usuario"}
          role={role}
          onMenuClick={() => setMobileMenuOpen(true)}
          notificaciones={notificaciones}
        />
        <main className="flex-1 p-3 sm:p-6">
          <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando...</p>}>
            <Outlet
              context={{
                role,
                isCalendarOpen,
                setCalendarOpen,
                refreshPeople,
                setNotificaciones,
                registerSidebarHandler,
                unregisterSidebarHandler,
                setActiveItem,
                adminActualId: user?.id || null, // Pasamos el ID real del admin logueado
              }}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/completar-perfil/estudiante", element: <Suspense fallback={<p className="p-4">Cargando...</p>}><FormularioEstudiante /></Suspense> },
  { path: "/completar-perfil/tutor", element: <Suspense fallback={<p className="p-4">Cargando...</p>}><FormularioTutor /></Suspense> },
  { path: "/estudiante/feedback/:comisionId/:tutorId", element: <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}><FormularioFeedbackEstudiante /></Suspense> },
  
  {
    path: "/",
    element: <ProtectedRoute />, 
    children: [
      {
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [
          { index: true, element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><Index /></ProtectedRoute> },
          { path: "admin/agregar-estudiante", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AgregarEstudiante /></ProtectedRoute> },
          { path: "admin/agregar-tutor", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AgregarTutor /></ProtectedRoute> },
          { path: "admin/editar-tutor/:id", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AgregarTutor /></ProtectedRoute> },
          { path: "admin/agregar-comision", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AgregarComision /></ProtectedRoute> },
          { path: "admin/editar-comision/:id", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AgregarComision /></ProtectedRoute> },
          { path: "admin/agregar-evento", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AgregarEvento /></ProtectedRoute> },
          { path: "admin/metricas", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><MetricasDashboard /></ProtectedRoute> },
          { path: "admin/feedback", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AdminFeedbackDashboard /></ProtectedRoute> },
          { path: "admin/solicitudes", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR]}><AdminSolicitudesDashboard /></ProtectedRoute> },
          { path: "tutor/:id", element: <ProtectedRoute allowedRoles={[Rol.TUTOR]}><TutorDashboard /></ProtectedRoute> },
          { path: "comision/:id", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR, Rol.TUTOR]}><RolGestionComision /></ProtectedRoute> },
          { path: "comision/:id/asistencia", element: <ProtectedRoute allowedRoles={[Rol.ADMINISTRADOR, Rol.TUTOR]}><AsistenciaComision /></ProtectedRoute> },
          { path: "estudiante/:id", element: <ProtectedRoute allowedRoles={[Rol.ESTUDIANTE]}><EstudianteDashboard /></ProtectedRoute> },
          { path: "estudiante/baja/:id", element: <ProtectedRoute allowedRoles={[Rol.ESTUDIANTE]}><PaginaDarDeBaja /></ProtectedRoute> },
          { path: "estudiante/baja", element: <ProtectedRoute allowedRoles={[Rol.ESTUDIANTE]}><PaginaDarDeBaja /></ProtectedRoute> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ]
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;