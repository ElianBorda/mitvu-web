// src/pages/AdminDashboard.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "../../pages/AdminDashboard";

// Mockear todos los servicios que usa el componente
vi.mock("@/service/apiEstudiante", () => ({
  obtenerTodosLosEstudiantesActivos: vi.fn(),
  obtenerTodosLosEstudiantesDeBaja: vi.fn(),
  asignarEstudianteAComision: vi.fn(),
}));

vi.mock("@/service/apiTutor", () => ({
  obtenerTodosLosTutores: vi.fn(),
}));

vi.mock("@/service/apiComision", () => ({
  obtenerTodasLasComisiones: vi.fn(),
}));

vi.mock("@/service/apiEvento", () => ({
  obtenerTodosLosEventos: vi.fn(),
}));

vi.mock("@/service/apiMetrica", () => ({
  obtenerMetricasDeAsistenciaGlobal: vi.fn(),
  obtenerMetricasDeBajaDeEstudiantes: vi.fn(),
}));

vi.mock("@/service/apiAnuncio", () => ({
  obtenerAnunciosGlobales: vi.fn(),
}));

// Mockear el contexto del layout
vi.mock("@/App", () => ({
  useLayoutContext: () => ({
    role: "admin",
    refreshPeople: vi.fn(),
    registerSidebarHandler: vi.fn(),
    unregisterSidebarHandler: vi.fn(),
    setActiveItem: vi.fn(),
    isCalendarOpen: false,
    setCalendarOpen: vi.fn(),
    setNotificaciones: vi.fn(),
  }),
}));

// Generador de estudiantes de prueba
const generarEstudiantes = (cantidad: number) =>
  Array.from({ length: cantidad }, (_, i) => ({
    id: `est-${i}`,
    apellido: `Apellido${i}`,
    nombre: `Nombre${i}`,
    mail: `estudiante${i}@mail.com`,
    dni: `4000000${i}`,
    carrera: "Tecnicatura en Programación",
    comision: null,
    asistencias: [],
  }));

// Helper para importar los mocks ya casteados
const setupMocks = async (cantidadEstudiantes: number) => {
  const { obtenerTodosLosEstudiantesActivos } =
    await import("@/service/apiEstudiante");
  const { obtenerTodosLosEstudiantesDeBaja } =
    await import("@/service/apiEstudiante");
  const { obtenerTodosLosTutores } = await import("@/service/apiTutor");
  const { obtenerTodasLasComisiones } = await import("@/service/apiComision");
  const { obtenerTodosLosEventos } = await import("@/service/apiEvento");
  const { obtenerMetricasDeAsistenciaGlobal } =
    await import("@/service/apiMetrica");
  const { obtenerAnunciosGlobales } = await import("@/service/apiAnuncio");

  const { obtenerMetricasDeBajaDeEstudiantes } =
    await import("@/service/apiMetrica");
  vi.mocked(obtenerMetricasDeBajaDeEstudiantes).mockResolvedValue({
    data: [],
  } as any);

  vi.mocked(obtenerTodosLosEstudiantesActivos).mockResolvedValue({
    data: generarEstudiantes(cantidadEstudiantes),
  } as any);
  vi.mocked(obtenerTodosLosEstudiantesDeBaja).mockResolvedValue({
    data: [],
  } as any);
  vi.mocked(obtenerTodosLosTutores).mockResolvedValue({ data: [] } as any);
  vi.mocked(obtenerTodasLasComisiones).mockResolvedValue({ data: [] } as any);
  vi.mocked(obtenerTodosLosEventos).mockResolvedValue({ data: [] } as any);
  vi.mocked(obtenerMetricasDeAsistenciaGlobal).mockResolvedValue({
    data: [],
  } as any);
  vi.mocked(obtenerAnunciosGlobales).mockResolvedValue({ data: [] } as any);
};

const renderAdminDashboard = (view = "") =>
  render(
    <MemoryRouter initialEntries={[`/?view=${view}`]}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </MemoryRouter>,
  );

describe("AdminDashboard — vista estudiantes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra los primeros 10 estudiantes cuando hay 11", async () => {
    await setupMocks(11);
    renderAdminDashboard("estudiantes");

    // Esperar que carguen los datos
    await waitFor(() => {
      expect(screen.getByTestId(`row-${0}-index`)).toBeInTheDocument();
      expect(screen.getByTestId(`row-${9}-index`)).toBeInTheDocument();
    });

    // El estudiante 11 NO debe aparecer en la primera página
    expect(screen.queryByTestId(`row-${10}-index`)).not.toBeInTheDocument();

    // Debe mostrar el texto de paginación
    expect(screen.getByText(/mostrando 1–10 de 11/i)).toBeInTheDocument();
  });

  it("muestra todos los estudiantes cuando hay menos de 10", async () => {
    await setupMocks(3);
    renderAdminDashboard("estudiantes");

    await waitFor(() => {
      expect(screen.getByTestId(`row-${0}-index`)).toBeInTheDocument();
      expect(screen.getByTestId(`row-${2}-index`)).toBeInTheDocument();
    });

    // No debe haber paginación
    expect(screen.queryByText(/mostrando/i)).not.toBeInTheDocument();
  });
});
