import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { crearEstudiante } from "@/service/apiEstudiante";
import { obtenerTodasLasComisiones } from "@/service/apiComision";
import { EstudianteBody } from "@/types/estudianteType";
import { Comision } from "@/types/comisionType";
import logo from "@/assets/mi-tvu-logo.png";

export default function FormularioEstudiante() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  
  const [form, setForm] = useState<EstudianteBody>({
    apellido: "",
    nombre: "",
    mail: "",
    carrera: "",
    comision_id: "", 
  });

  useEffect(() => {
    obtenerTodasLasComisiones()
      .then((res) => setComisiones(res.data))
      .catch((err) => console.error("Error al obtener comisiones:", err));
  }, []);

  const handleChange = (field: keyof EstudianteBody, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apellido.trim() || !form.nombre.trim() || !form.mail.trim() || !form.carrera.trim()) {
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      await crearEstudiante(form);
      toast.success("Tus datos fueron registrados exitosamente.");
      navigate("/"); 
    } catch (error) {
      toast.error("Error al registrar tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8">
        <img src={logo} alt="miTVU" className="h-12 object-contain" />
      </div>

      <div className="w-full max-w-xl bg-card rounded-xl shadow-card border border-border p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
          Completá tu perfil de Estudiante
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ingresá tus datos personales para acceder a la plataforma.
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
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Lucía"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mail">Correo electrónico *</Label>
              <Input
                id="mail"
                type="email"
                placeholder="Ej: lucia.martinez@example.com"
                value={form.mail}
                onChange={(e) => handleChange("mail", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="carrera">Carrera *</Label>
              <Input
                id="carrera"
                placeholder="Ej: Lic. en Informática"
                value={form.carrera}
                onChange={(e) => handleChange("carrera", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comision">Comisión (Opcional)</Label>
            <Select
              value={form.comision_id}
              onValueChange={(val) => handleChange("comision_id", val)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar comisión..." />
              </SelectTrigger>
              <SelectContent>
                {comisiones.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    Aún no hay comisiones disponibles
                  </div>
                ) : (
                  comisiones.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      Comisión {c.numero} - {c.departamento} - {c.localidad} - {c.horarioInicio} a {c.horarioFin}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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