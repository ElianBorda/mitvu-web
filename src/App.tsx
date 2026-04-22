import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import AgregarEstudiante from "./pages/AgregarEstudiante.tsx";
import AgregarTutor from "./pages/AgregarTutor.tsx";
import NotFound from "./pages/NotFound.tsx";
import AgregarComision from "./pages/AgregarComision.tsx";
import TutorDashboard from "./pages/TutorDashboard.tsx";
import EstudianteDashboard from "./pages/EstudianteDashboard.tsx";
import AdminComision from "./pages/AdminComision.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/agregar-estudiante" element={<AgregarEstudiante />} />
          <Route path="/admin/agregar-tutor" element={<AgregarTutor />} />
          <Route path="/admin/agregar-comision" element={<AgregarComision />} />
          <Route path="/admin/editar-comision/:id" element={<AgregarComision />} />
          <Route path="/admin/comision/:id" element={<AdminComision />} />
          <Route path="/tutor/:id" element={<TutorDashboard />} />
          <Route path="/estudiante/:id" element={<EstudianteDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
