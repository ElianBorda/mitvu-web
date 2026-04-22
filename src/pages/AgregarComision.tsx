import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { set } from "date-fns";
import { getObtenerComision, postCrearComision, putModificarComision } from "@/service/apiComision";
import { error } from "console";

export default function AgregarComision() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  
  const [localidad, setLocalidad] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [carrera, setCarrera] = useState("");
  const [aula, setAula] = useState("");
  const [horarioInicioHS, setHorarioInicioHS] = useState("");
  const [horarioInicioMS, setHorarioInicioMS] = useState("");
  const [horarioFinHS, setHorarioFinHS] = useState("");
  const [horarioFinMS, setHorarioFinMS] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getObtenerComision(id).then(({data}) => {
      setLocalidad(data.localidad ?? "");
      setDepartamento(data.departamento ?? "");
      setCarrera(data.carrera ?? "");
      setAula(data.aula ?? "");
      setHorarioInicioHS(data.horarioInicio.split(":")[0]);
      setHorarioInicioMS(data.horarioInicio.split(":")[1]);
      setHorarioFinHS(data.horarioFin.split(":")[0]);
      setHorarioFinMS(data.horarioFin.split(":")[1]);
    }).catch(() => {
      toast.error("La comisión no existe.")
      navigate("/?view=comisiones");
      return; 
    })
  }, [id, isEdit, navigate]);
  
  const hayCamposVacios = !localidad || !departamento || !carrera || !aula || !horarioInicioHS || !horarioInicioMS || !horarioFinHS || !horarioFinMS;

  const esHoraValida = (hora: string) => {
      const soloNumerosRegex = /^\d+$/;
      if (!soloNumerosRegex.test(hora)) {
        return false;
      }
      const horaInt = parseInt(hora, 10);
      return horaInt >= 0 && horaInt <= 23;
  };

  const esMinutoValido = (minutos: string) => {
      const soloNumerosRegex = /^\d+$/;
      if (!soloNumerosRegex.test(minutos)) {
        return false;
      }
      const minutosInt = parseInt(minutos, 10);
      return minutosInt >= 0 && minutosInt <= 59;
  }

  const validarHora = (hora: string) => !esHoraValida(hora) ? "" : hora;
  const validarMinutos = (minutos: string) => !esMinutoValido(minutos) ? "" : minutos;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const horarioInicio = `${horarioInicioHS.padStart(2, "0")}:${horarioInicioMS.padStart(2, "0")}`;
    const horarioFin = `${horarioFinHS.padStart(2, "0")}:${horarioFinMS.padStart(2, "0")}`;

    if (hayCamposVacios) {
      toast.error("Por favor completá todos los campos obligatorios.");
      return;
    }

    const comisionBody = {
      localidad,
      departamento,
      carrera,
      aula,
      horarioInicio,
      horarioFin,
    }

    if (isEdit){
      putModificarComision(id, comisionBody).then(() => {
        toast.success("Comisión modificada exitosamente.");
        navigate("/?view=comisiones");
      }).catch(() => {
        toast.error("Error al modificar la comisión.");
      })
    } else {
      postCrearComision(comisionBody).then(() => {
        toast.success("Comisión creada exitosamente.");
        navigate("/?view=comisiones");
      }).catch(() => {
        toast.error("Error al crear la comisión.");
      });
    }

    
  };


return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          onClick={() => navigate("/?view=comisiones")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </button>
        <div className="bg-card rounded-xl shadow-card border border-border p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
            {isEdit ? "Modificar comisión" : "Agregar comisión"}

          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {isEdit
              ? "Actualizá los datos de la comisión seleccionada."
              : "Completá los datos de la nueva comisión para darla de alta en el sistema."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="localidad">Localidad *</Label>
                <Input
                  id="localidad"
                  placeholder="Localidad"
                  value={localidad}
                  onChange={e => setLocalidad(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Input
                  id="departamento"
                  placeholder="Departamento"
                  value={departamento}
                  onChange={e => setDepartamento(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="carrera">Carrera *</Label>
                <Input
                  id="carrera"
                  placeholder="Carrera"
                  value={carrera}
                  onChange={e => setCarrera(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aula">Aula *</Label>
                <Input
                  id="aula"
                  placeholder="Aula"
                  value={aula}
                  onChange={e => setAula(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horario de inicio *</Label>
              <div className="flex items-center gap-2">
                <Input
                  className="w-20 text-center"
                  placeholder="HH"
                  value={horarioInicioHS}
                  onChange={e => setHorarioInicioHS(validarHora(e.target.value))}
                  maxLength={2}
                />
                <span className="text-muted-foreground font-medium">:</span>
                <Input
                  className="w-20 text-center"
                  placeholder="MM"
                  value={horarioInicioMS}
                  onChange={e => setHorarioInicioMS(validarMinutos(e.target.value))}
                  maxLength={2}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horario de fin *</Label>
              <div className="flex items-center gap-2">
                <Input
                  className="w-20 text-center"
                  placeholder="HH"
                  value={horarioFinHS}
                  onChange={e => setHorarioFinHS(validarHora(e.target.value))}
                  maxLength={2}
                />
                <span className="text-muted-foreground font-medium">:</span>
                <Input
                  className="w-20 text-center"
                  placeholder="MM"
                  value={horarioFinMS}
                  onChange={e => setHorarioFinMS(validarMinutos(e.target.value))}
                  maxLength={2}
                />
              </div>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {isEdit ? "Guardar cambios" : "Confirmar y crear comisión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
