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

export default function AgregarEstudiante() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    apellido: "",
    nombre: "",
    dni: "",
    carrera: "",
    comision_id: "",
  });
  const [comisiones, setComisiones] = useState<any[]>([]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apellido.trim() || !form.nombre.trim() || !form.dni.trim() || !form.carrera.trim()) {
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/estudiantes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
    if (!res.ok) throw new Error("Error al guardar la publicación");
    toast.success(`Estudiante ${form.apellido}, ${form.nombre} creado exitosamente.`);
    navigate("/?view=students");
  };

  const fetchComisiones = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comisiones`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) throw new Error("Error al cargar las comisiones");
    const data = await res.json();
    setComisiones(data);
  }

  useEffect(() => {
    fetchComisiones();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </button>

        {/* Card */}
        <div className="bg-card rounded-xl shadow-card border border-border p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
            Agregar estudiante
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Completá los datos del nuevo estudiante para darlo de alta en el sistema.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  placeholder="Ej: Martínez"
                  value={form.apellido}
                  onChange={e => handleChange("apellido", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Lucía"
                  value={form.nombre}
                  onChange={e => handleChange("nombre", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  placeholder="Ej: 42356789"
                  value={form.dni}
                  onChange={e => handleChange("dni", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrera">Carrera *</Label>
                <Input
                  id="carrera"
                  placeholder="Ej: Lic. en Informática"
                  value={form.carrera}
                  onChange={e => handleChange("carrera", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comision">Comisión (opcional)</Label>
              <Select
                value={form.comision_id}
                onValueChange={val => handleChange("comision_id", val)}
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
                    comisiones.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        Comision {c.numero} - {c.departamento} - {c.localidad} - {c.horarioInicio} a {c.horarioFin}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
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
