import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { commissions } from "@/data/mockData";
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

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    dni: "",
    career: "",
    commissionId: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lastName.trim() || !form.firstName.trim() || !form.dni.trim() || !form.career.trim()) {
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }
    // Mock: just navigate back with success
    toast.success(`Estudiante ${form.lastName}, ${form.firstName} creado exitosamente.`);
    navigate("/?view=students");
  };

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
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Ej: Martínez"
                  value={form.lastName}
                  onChange={e => handleChange("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Ej: Lucía"
                  value={form.firstName}
                  onChange={e => handleChange("firstName", e.target.value)}
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
                <Label htmlFor="career">Carrera *</Label>
                <Input
                  id="career"
                  placeholder="Ej: Lic. en Informática"
                  value={form.career}
                  onChange={e => handleChange("career", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Comisión (opcional)</Label>
              <Select
                value={form.commissionId}
                onValueChange={val => handleChange("commissionId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar comisión..." />
                </SelectTrigger>
                <SelectContent>
                  {commissions.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.locality}
                    </SelectItem>
                  ))}
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
