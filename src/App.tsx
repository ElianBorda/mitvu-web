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
import { Tutor } from "@/types/tutorType";
import { Estudiante } from "@/types/estudianteType";
import { Administrador } from "@/types/adminstradorType";
import { Notificacion } from "@/types/notificacionType";
import { obtenerTodosLosAdministradores } from "@/service/apiAdministrador";
import { obtenerTodosLosTutores } from "@/service/apiTutor";
import {
  asignarTokenAEstudiante,
  obtenerTodosLosEstudiantes,
} from "@/service/apiEstudiante";

import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";

const Index = lazy(() => import("./pages/Index.tsx"));
const AgregarEstudiante = lazy(() => import("./pages/AgregarEstudiante.tsx"));
const AgregarTutor = lazy(() => import("./pages/AgregarTutor.tsx"));
const AgregarComision = lazy(() => import("./pages/AgregarComision.tsx"));
const RolGestionComision = lazy(() => import("./pages/RolGestionComision.tsx"));
const TutorDashboard = lazy(() => import("./pages/TutorDashboard.tsx"));
const EstudianteDashboard = lazy(
  () => import("./pages/EstudianteDashboard.tsx"),
);
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

const userNames: Record<Role, string> = {
  estudiante: "Lucía Martínez",
  tutor: "María González",
  admin: "Admin TVU",
};

export type LayoutContextType = {
  role: Role;
  isCalendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshPeople: () => Promise<void>;
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

  const [role, setRole] = useState<Role>("admin");
  const [activeItem, setActiveItem] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [previousActiveItemTable, setPreviousActiveItemTable] = useState<
    string | null
  >(activeItem || null);

  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [adminActualId, setAdminActualId] = useState<string | null>(null);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const [studentUnenrolled, setStudentUnenrolled] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("studentUnenrolled") === "true",
  );

  useEffect(() => {
    obtenerTodosLosAdministradores()
      .then((res) => setAdministradores(res.data))
      .catch(console.error);
    obtenerTodosLosTutores()
      .then((res) => setTutores(res.data))
      .catch(console.error);
    obtenerTodosLosEstudiantes()
      .then((res) => setEstudiantes(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (administradores.length > 0 && !adminActualId) {
      setAdminActualId(String(administradores[0].id));
    }
  }, [administradores, adminActualId]);

  const refreshPeople = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        obtenerTodosLosTutores(),
        obtenerTodosLosEstudiantes(),
      ]);
      setTutores(tRes.data);
      setEstudiantes(eRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (location.pathname.includes("/estudiante")) {
      setRole("estudiante");
      setActiveItem("home");
    } else if (location.pathname.includes("/tutor")) {
      setRole("tutor");
      setActiveItem("comisiones");
    } else if (location.pathname.includes("/admin/feedback")) {
      setRole("admin");
      setActiveItem("feedback");
    } else if (location.pathname.includes("/admin/metricas")) {
      setRole("admin");
      setActiveItem("metricas");
    } else if (location.pathname.includes("/admin/solicitudes")) {
      setRole("admin");
      setActiveItem("solicitudes");
    } else if (
      location.pathname === "/" ||
      location.pathname.includes("/admin")
    ) {
      setRole("admin");
      setActiveItem(previousActiveItemTable || "comisiones");
    }

    setStudentUnenrolled(localStorage.getItem("studentUnenrolled") === "true");
  }, [location.pathname, previousActiveItemTable]);

  const [sidebarHandlers, setSidebarHandlers] = useState<
    Record<string, () => void>
  >({});

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
    if (sidebarId !== "metricas") {
      setPreviousActiveItemTable(sidebarId);
    }

    if (sidebarHandlers[sidebarId]) {
      sidebarHandlers[sidebarId]();
      return;
    }

    if (sidebarId === "metricas") {
      navigate("/admin/metricas");
      return;
    }

    if (sidebarId === "feedback") {
      navigate("/admin/feedback");
      return;
    }

    if (sidebarId === "solicitudes") {
      navigate("/admin/solicitudes");
      return;
    }

    if (
      sidebarId === "comisiones" ||
      sidebarId === "estudiantes" ||
      sidebarId === "tutores"
    ) {
      navigate(`/?view=${sidebarId}`);
      return;
    }

    if (sidebarId === "baja" && role === "estudiante") {
      const pathSegments = location.pathname.split("/");
      const currentId = pathSegments[2];

      if (currentId) navigate(`/estudiante/baja/${currentId}`);
      else navigate("/estudiante/baja");
      return;
    }
    if (sidebarId === "calendario") setCalendarOpen((prev) => !prev);
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
          onMenuClick={async () => {
            await refreshPeople();
            setMobileMenuOpen(true);
          }}
          administradores={administradores}
          onAdminSelect={(id) => {
            setAdminActualId(String(id));
            navigate(`/`);
          }}
          tutores={tutores}
          onTutorSelect={(id) => navigate(`/tutor/${id}`)}
          estudiantes={estudiantes}
          onEstudianteSelect={(id) => {
            localStorage.removeItem("studentUnenrolled");
            setStudentUnenrolled(false);
            setRole("estudiante");
            navigate(`/estudiante/${id}`);
          }}
          notificaciones={notificaciones}
        />
        <main className="flex-1 p-3 sm:p-6">
          <Suspense
            fallback={
              <p className="text-muted-foreground text-sm">Cargando...</p>
            }
          >
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
                adminActualId,
              }}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/completar-perfil/estudiante",
    element: (
      <Suspense fallback={<p className="p-4">Cargando...</p>}>
        <FormularioEstudiante />
      </Suspense>
    ),
  },
  {
    path: "/completar-perfil/tutor",
    element: (
      <Suspense fallback={<p className="p-4">Cargando...</p>}>
        <FormularioTutor />
      </Suspense>
    ),
  },
  {
    path: "/estudiante/feedback/:comisionId/:tutorId",
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Cargando...</div>}>
        <FormularioFeedbackEstudiante />
      </Suspense>
    ),
  },
  
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { path: "admin/agregar-estudiante", element: <AgregarEstudiante /> },
      { path: "admin/agregar-tutor", element: <AgregarTutor /> },
      { path: "admin/editar-tutor/:id", element: <AgregarTutor /> },
      { path: "admin/agregar-comision", element: <AgregarComision /> },
      { path: "admin/editar-comision/:id", element: <AgregarComision /> },
      { path: "comision/:id", element: <RolGestionComision /> },
      { path: "tutor/:id", element: <TutorDashboard /> },
      { path: "estudiante/:id", element: <EstudianteDashboard /> },
      { path: "estudiante/baja/:id", element: <PaginaDarDeBaja /> },
      { path: "estudiante/baja", element: <PaginaDarDeBaja /> },
      { path: "admin/agregar-evento", element: <AgregarEvento /> },
      { path: "comision/:id/asistencia", element: <AsistenciaComision /> },
      { path: "admin/metricas", element: <MetricasDashboard /> },
      { path: "admin/feedback", element: <AdminFeedbackDashboard /> },
      { path: "admin/solicitudes", element: <AdminSolicitudesDashboard /> },
      { path: "*", element: <NotFound /> },
    ],
  },
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
