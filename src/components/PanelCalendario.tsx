import { useState } from "react";
// Importamos 'parse' para convertir el string del backend a un objeto Date real
import { isSameDay, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Evento } from "@/types/eventoType";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { postCrearEvento } from "@/service/apiEvento";

interface Props {
  eventos: Evento[];
  onEventAdded?: () => void;
}

export default function PanelCalendario({ eventos, onEventAdded }: Props) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(
    new Date()
  );

  const parseFechaBackend = (fechaStr: string) => {
    return parse(fechaStr, "dd-MM-yyyy", new Date());
  };
  
  const eventosSeleccionados = fechaSeleccionada
    ? eventos.filter((e) => isSameDay(parseFechaBackend(e.fecha), fechaSeleccionada))
    : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    fecha: "",
    titulo: "",
    descripcion: "",
  });

  

  const handleOpenDialog = () => {
    setForm({
      fecha: fechaSeleccionada ? format(fechaSeleccionada, "yyyy-MM-dd") : "",
      titulo: "",
      descripcion: "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.fecha || !form.titulo || !form.descripcion) {
      toast.error("Completá todos los campos.");
      return;
    }

    const [year, month, day] = form.fecha.split("-");
    const fechaParaBackend = `${day}-${month}-${year}`;

    postCrearEvento({
      titulo: form.titulo,
      descripcion: form.descripcion,
      fecha: fechaParaBackend, 
    }).then(() => {
        toast.success("Evento agregado al calendario.");
        setDialogOpen(false);
        if (onEventAdded) onEventAdded();
        setFechaSeleccionada(new Date(`${form.fecha}T00:00:00`));
      })
      .catch((error) => {
        toast.error("Error al guardar el evento.");
      });
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-3 sm:p-5">
      <Calendar
        mode="single"
        selected={fechaSeleccionada}
        onSelect={setFechaSeleccionada}
        locale={es}
        className="flex justify-center p-0"
        components={{
          DayContent: (props) => {
            const date = props.date;
            // Usamos nuestra función parseFechaBackend acá también
            const hayEventos = eventos.some((e) =>
              isSameDay(parseFechaBackend(e.fecha), date)
            );
            const seleccionado =
              fechaSeleccionada && isSameDay(date, fechaSeleccionada);

            return (
              <div className="relative w-full h-full flex items-center justify-center">
                <span>{date.getDate()}</span>
                {hayEventos && !seleccionado && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
            );
          },
        }}
      />

      {eventosSeleccionados.length > 0 && fechaSeleccionada && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <p className="text-xs font-semibold text-foreground mb-2">
            {format(fechaSeleccionada, "d 'de' MMMM", { locale: es })}
          </p>
          {eventosSeleccionados.map((e, i) => (
            <div key={i} className="bg-secondary rounded-md px-3 py-2">
              <p className="text-xs font-medium text-foreground">{e.titulo}</p>
              <p className="text-[10px] text-muted-foreground">
                {e.descripcion}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleOpenDialog}
        className="mt-4 w-full py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
      >
        + Agregar evento en el calendario
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Fecha</Label>
              <Input
                id="ev-date"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Título del evento</Label>
              <Input
                id="ev-title"
                placeholder="Ej: Feriado Institucional"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">Descripción</Label>
              <Input
                id="ev-desc"
                placeholder="Ej: No se dictarán clases"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}