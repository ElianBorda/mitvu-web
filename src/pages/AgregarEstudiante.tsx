import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Comision } from "@/types/comisionType";
import { obtenerTodasLasComisiones } from "@/service/apiComision";
import { crearEstudiante } from "@/service/apiEstudiante";

export default function AgregarEstudiante() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    apellido: "",
    nombre: "",
    dni: "",
    mail: "",
    carrera: "",
    comision_id: "",
  });
  const [comisiones, setComisiones] = useState<Comision[]>([]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.apellido.trim() ||
      !form.nombre.trim() ||
      !form.dni.trim() ||
      !form.carrera.trim()
    ) {
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }
    try {
      const res = await crearEstudiante(form);
      toast.success(
        `Estudiante ${form.apellido}, ${form.nombre} creado exitosamente.`,
      );
      navigate("/?view=students");
    } catch (error) {
      toast.error("Error al crear el estudiante.");
      throw new Error("Error al crear el estudiante");
    }
  };

  const fetchComisiones = async () => {
    try {
      const response = await obtenerTodasLasComisiones();
      setComisiones(response.data);
    } catch (error) {
      console.error("Error al obtener comisiones:", error);
    }
  };

  useEffect(() => {
    fetchComisiones();
  }, []);

  return (
    // CAMBIO DE ESTILOS AQUÍ
    <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </button>

        <div className="bg-card rounded-xl shadow-card border border-border p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
            Agregar estudiante
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Completá los datos del nuevo estudiante para darlo de alta en el
            sistema.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  placeholder="Ej: Martínez"
                  value={form.apellido}
                  onChange={(e) => handleChange("apellido", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Lucía"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  placeholder="Ej: 42356789"
                  value={form.dni}
                  onChange={(e) => handleChange("dni", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mail">Correo electrónico *</Label>
                <Input
                  id="mail"
                  placeholder="Ej: carlos.gonzalez@example.com"
                  value={form.mail}
                  onChange={(e) => handleChange("mail", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="carrera">Carrera *</Label>
              <Input
                id="carrera"
                placeholder="Ej: Lic. en Informática"
                value={form.carrera}
                onChange={(e) => handleChange("carrera", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comision">Comisión (opcional)</Label>
              <Select
                value={form.comision_id}
                onValueChange={(val) => handleChange("comision_id", val)}
                onOpenChange={fetchComisiones}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar comisión..." />
                </SelectTrigger>
                <SelectContent>
                  {comisiones.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      Aún no hay comisiones en el sistema
                    </div>
                  ) : (
                    comisiones.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        Comision {c.numero} - {c.departamento} - {c.localidad} -{" "}
                        {c.horarioInicio} a {c.horarioFin}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Confirmar y crear estudiante
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}