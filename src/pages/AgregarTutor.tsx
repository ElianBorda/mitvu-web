import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { comisionesSinTutor } from "@/service/apiComision";
import { crearTutor } from "@/service/apiTutor";

export default function AgregarTutor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    apellido: "",
    nombre: "",
    dni: "",
    mail: "",
    comisiones_ids: [] as string[],
  });
  const [comisiones, setComisiones] = useState<any[]>([]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCommission = (id: string) => {
    setForm((prev) => ({
      ...prev,
      comisiones_ids: prev.comisiones_ids.includes(id)
        ? prev.comisiones_ids.filter((c) => c !== id)
        : [...prev.comisiones_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apellido.trim() || !form.nombre.trim() || !form.dni.trim()) {
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }
   
    try {
      const res = await crearTutor(form);
      toast.success(
        `Tutor ${form.apellido}, ${form.nombre} creado exitosamente.`,
      );
      navigate("/?view=tutors");
    } catch (error) {
      toast.error("Error al crear el tutor.");
      throw new Error("Error al crear el tutor");
    }
    
  };

  const fetchComisiones = async () => {
    try {
      const res = await comisionesSinTutor();
      setComisiones(res.data);
    } catch (error) {
      console.error("Error al cargar las comisiones:", error);
    }
  };

  const selectedLabels = comisiones
    .filter((c) => form.comisiones_ids.includes(c.id))
    .map(
      (c) =>
        c.horarioInicio +
        " a " +
        c.horarioFin +
        " - " +
        c.departamento +
        " - " +
        c.localidad,
    );

  return (
    // CAMBIO DE ESTILOS AQUÍ
    <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center bg-background px-4">
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
            Agregar tutor
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Completá los datos del nuevo tutor para darlo de alta en el sistema.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  placeholder="Ej: González"
                  value={form.apellido}
                  onChange={(e) => handleChange("apellido", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Carlos"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
              </div>
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

            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                placeholder="Ej: 30456789"
                value={form.dni}
                onChange={(e) => handleChange("dni", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Comisiones a cargo (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={fetchComisiones}
                  >
                    <span className="truncate text-muted-foreground">
                      {selectedLabels.length > 0
                        ? selectedLabels.join(", ")
                        : "Seleccionar comisiones..."}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-1 max-h-60 overflow-y-auto"
                  align="start"
                >
                  {comisiones.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      Aún no hay comisiones en el sistema
                    </div>
                  ) : (
                    comisiones.map((c) => {
                      const selected = form.comisiones_ids.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCommission(c.id)}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded border border-primary shrink-0">
                            {selected && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </span>
                          Comision {c.numero} - {c.departamento} - {c.localidad}{" "}
                          - {c.horarioInicio} a {c.horarioFin}
                        </button>
                      );
                    })
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Confirmar y crear tutor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}