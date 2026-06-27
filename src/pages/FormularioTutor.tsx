import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Tv, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearSolicitudDeTutor } from "@/service/apiSolicitudTutor";
import { SolicitudTutorBody, EstadoAcademico, EstadoDiplomatura } from "@/types/solicitudTutorType";
import logo from "@/assets/mi-tvu-logo.png";

export default function FormularioTutor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState<SolicitudTutorBody>({
    nombre: "",
    apellido: "",
    correo: "",
    dni: "",
    carrera: "",
    estadoAcademico: "" as EstadoAcademico,
    experienciaComoEgresado: false,
    fueTutorAnteriormente: false,
    estadoDiplomatura: "" as EstadoDiplomatura,
  });

  const handleChange = (field: keyof SolicitudTutorBody, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apellido.trim() || !form.nombre.trim() || !form.dni.trim() || !form.correo.trim() || !form.carrera.trim()) {
      toast.error("Por favor completá todos los campos de texto obligatorios.");
      return;
    }
    if (!form.estadoAcademico || !form.estadoDiplomatura) {
      toast.error("Por favor seleccioná tu estado académico y de diplomatura.");
      return;
    }

    setLoading(true);
    
    // PROMESA PURA (Sin async/await)
    crearSolicitudDeTutor(form)
      .then(() => {
        toast.success("¡Tu solicitud fue enviada con éxito! Queda a la espera de aprobación.");
        navigate("/");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Hubo un error al enviar tu solicitud. Intentalo de nuevo.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8">
        <img src={logo} alt="miTVU" className="h-12 object-contain" />
      </div>

      <div className="w-full max-w-2xl bg-card rounded-xl shadow-card border border-border p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Users size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Postulación a Tutoría</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Completá el siguiente formulario con tus datos académicos y experiencia. Tu solicitud será evaluada por un administrador.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" placeholder="Ej: Carlos" value={form.nombre} onChange={(e) => handleChange("nombre", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input id="apellido" placeholder="Ej: González" value={form.apellido} onChange={(e) => handleChange("apellido", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI *</Label>
              <Input id="dni" placeholder="Ej: 30456789" value={form.dni} onChange={(e) => handleChange("dni", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico *</Label>
              <Input id="correo" type="email" placeholder="Ej: carlos@example.com" value={form.correo} onChange={(e) => handleChange("correo", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="carrera">Carrera que cursó o está cursando *</Label>
              <Input id="carrera" placeholder="Ej: Lic. en Informática" value={form.carrera} onChange={(e) => handleChange("carrera", e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-secondary/30 p-5 rounded-lg border border-border/50">
            <div className="flex flex-col gap-1.5">
              <Label>Estado Académico *</Label>
              <select required className="p-2.5 rounded-md border border-border bg-background text-sm" value={form.estadoAcademico} onChange={e => handleChange('estadoAcademico', e.target.value)}>
                <option value="" disabled>Seleccioná tu estado...</option>
                <option value={EstadoAcademico.ESTUDIANTE_AVANZADO}>Estudiante Avanzado</option>
                <option value={EstadoAcademico.EGRESADO}>Egresado</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Estado Diplomatura TVU *</Label>
              <select required className="p-2.5 rounded-md border border-border bg-background text-sm" value={form.estadoDiplomatura} onChange={e => handleChange('estadoDiplomatura', e.target.value)}>
                <option value="" disabled>Seleccioná una opción...</option>
                <option value={EstadoDiplomatura.REALIZADA}>Realizada (Completa)</option>
                <option value={EstadoDiplomatura.CURSANDO}>Cursando actualmente</option>
                <option value={EstadoDiplomatura.NO_REALIZADA}>No la realicé</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>¿Tiene experiencia como egresado? *</Label>
              <select required className="p-2.5 rounded-md border border-border bg-background text-sm" value={form.experienciaComoEgresado ? "SI" : "NO"} onChange={e => handleChange('experienciaComoEgresado', e.target.value === "SI")}>
                <option value="NO">No</option>
                <option value="SI">Sí</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>¿Fue tutor anteriormente? *</Label>
              <select required className="p-2.5 rounded-md border border-border bg-background text-sm" value={form.fueTutorAnteriormente ? "SI" : "NO"} onChange={e => handleChange('fueTutorAnteriormente', e.target.value === "SI")}>
                <option value="NO">No</option>
                <option value="SI">Sí</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Enviar solicitud de postulación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}