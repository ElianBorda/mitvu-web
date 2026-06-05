// src/pages/AsistenciaComision.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AsistenciaComision from "../../pages/AsistenciaComision";

vi.mock("@/service/apiEstudiante", () => ({
  obtenerEstudiantesDeComision: vi.fn(),
  pasarAsistenciaDeEstudiante: vi.fn(),
}));

vi.mock("@/service/apiEvento", () => ({
  obtenerTodosLosEventos: vi.fn(),
}));

vi.mock("@/service/apiComision", () => ({
  getObtenerComision: vi.fn(),
}));

const mockEstudiantes = [
  {
    id: "est-1",
    apellido: "Rodríguez",
    nombre: "Juan",
    asistencias: [],
  },
];

const mockEventos = [
  {
    id: "ev-1",
    titulo: "Encuentro 1",
    fecha: "18-05-2026",
  },
];

const setupMocks = async () => {
  const { obtenerEstudiantesDeComision, pasarAsistenciaDeEstudiante } =
    await import("@/service/apiEstudiante");
  const { obtenerTodosLosEventos } = await import("@/service/apiEvento");
  const { getObtenerComision } = await import("@/service/apiComision");

  vi.mocked(obtenerEstudiantesDeComision).mockResolvedValue({
    data: mockEstudiantes,
  } as any);
  vi.mocked(obtenerTodosLosEventos).mockResolvedValue({
    data: mockEventos,
  } as any);
  vi.mocked(getObtenerComision).mockResolvedValue({
    data: { id: "com-1", numero: 1, localidad: "Bernal", departamento: "Informática" },
  } as any);
  vi.mocked(pasarAsistenciaDeEstudiante).mockResolvedValue({} as any);
};

const renderAsistencia = () =>
  render(
    <MemoryRouter initialEntries={["/comision/com-1/asistencia"]}>
      <Routes>
        <Route path="/comision/:id/asistencia" element={<AsistenciaComision />} />
      </Routes>
    </MemoryRouter>,
  );

describe("AsistenciaComision — interacción", () => {
  beforeEach(() => vi.clearAllMocks());

  it("al clickear 'Ausente' la celda queda marcada como ausente", async () => {
    await setupMocks();
    const user = userEvent.setup();
    renderAsistencia();

    // Esperar que cargue la tabla
    await waitFor(() => {
      expect(screen.getByText("Rodríguez, Juan")).toBeInTheDocument();
    });

    // La celda inicialmente muestra "—"
    const celdaInicial = screen.getByRole("button", { name: "—" });
    expect(celdaInicial).toBeInTheDocument();

    // Abrir el dropdown
    await user.click(celdaInicial);

    // Seleccionar "Ausente"
    const opcionAusente = screen.getByRole("button", { name: /ausente/i });
    await user.click(opcionAusente);

    // La celda ahora debe mostrar "Ausente" con el color rojo
    await waitFor(() => {
      const celdaActualizada = screen.getByRole("button", { name: /ausente/i });
      expect(celdaActualizada).toHaveClass("bg-red-100");
      expect(celdaActualizada).toHaveClass("text-red-700");
    });
  });

  it("llama a la API con los datos correctos al seleccionar asistencia", async () => {
    await setupMocks();
    const { pasarAsistenciaDeEstudiante } = await import("@/service/apiEstudiante");
    const user = userEvent.setup();
    renderAsistencia();

    await waitFor(() => {
      expect(screen.getByText("Rodríguez, Juan")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "—" }));
    await user.click(screen.getByRole("button", { name: /presente/i }));

    await waitFor(() => {
      expect(vi.mocked(pasarAsistenciaDeEstudiante)).toHaveBeenCalledWith(
        "est-1",
        expect.objectContaining({ tipoDeAsistencia: "PRESENTE" }),
      );
    });
  });
});