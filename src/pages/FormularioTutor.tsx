import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { crearTutor } from "@/service/apiTutor";
import { comisionesSinTutor } from "@/service/apiComision";
import { TutorBody } from "@/types/tutorType";
import { Comision } from "@/types/comisionType";
import logo from "@/assets/mi-tvu-logo.png";

export default function FormularioTutor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  
  const [form, setForm] = useState<TutorBody>({
    apellido: "",
    nombre: "",
    dni: "",
    mail: "",
    comisiones_ids: [], 
  });

  useEffect(() => {
    comisionesSinTutor()
      .then((res) => setComisiones(res.data))
      .catch((err) => console.error("Error al cargar comisiones:", err));
  }, []);

  const handleChange = (field: keyof TutorBody, value: string) => {
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
    if (!form.apellido.trim() || !form.nombre.trim() || !form.dni.trim() || !form.mail.trim()) {
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      await crearTutor(form);
      toast.success("Tu perfil de tutor fue registrado exitosamente.");
      navigate("/");
    } catch (error) {
      toast.error("Error al registrar tus datos.");
    } finally {
      setLoading(false);
    }
  };

  const selectedLabels = comisiones
    .filter((c) => form.comisiones_ids.includes(c.id))
    .map((c) => `${c.horarioInicio} a ${c.horarioFin} - ${c.localidad}`);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8">
        <img src={logo} alt="miTVU" className="h-12 object-contain" />
      </div>

      <div className="w-full max-w-xl bg-card rounded-xl shadow-card border border-border p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
          Completá tu perfil de Tutor
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ingresá tus datos personales para acceder a la gestión de comisiones.
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
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Carlos"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                placeholder="Ej: 30456789"
                value={form.dni}
                onChange={(e) => handleChange("dni", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mail">Correo electrónico *</Label>
              <Input
                id="mail"
                type="email"
                placeholder="Ej: carlos@example.com"
                value={form.mail}
                onChange={(e) => handleChange("mail", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Comisiones a cargo (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                >
                  <span className="truncate text-muted-foreground">
                    {selectedLabels.length > 0
                      ? selectedLabels.join(", ")
                      : "Seleccionar comisiones..."}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-1 max-h-60 overflow-y-auto" align="start">
                {comisiones.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No hay comisiones sin tutor asignado.
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
                          {selected && <Check className="h-3 w-3 text-primary" />}
                        </span>
                        Comisión {c.numero} - {c.departamento} - {c.localidad}
                      </button>
                    );
                  })
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Confirmar y registrarme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}