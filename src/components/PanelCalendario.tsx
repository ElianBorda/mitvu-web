import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Importamos el componente de alerta
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { postCrearEvento, putModificarEvento, deleteEvento, postCrearEventoParaComision } from "@/service/apiEvento";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  eventos: Evento[];
  idComision?: string;
  onEventAdded?: () => void;
}

export default function PanelCalendario({ eventos, onEventAdded, idComision }: Props) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(new Date());
  
  // Estados para modales y edición
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoAEliminarId, setEventoAEliminarId] = useState<string | null>(null);
  const [eventoEditandoId, setEventoEditandoId] = useState<string | null>(null);

  const [form, setForm] = useState({
    fecha: "",
    titulo: "",
    descripcion: "",
  });

  const parseFechaBackend = (fechaStr: string) => {
    return parse(fechaStr, "dd-MM-yyyy", new Date());
  };
  
  const eventosSeleccionados = fechaSeleccionada
    ? eventos.filter((e) => isSameDay(parseFechaBackend(e.fecha), fechaSeleccionada))
    : [];

  const handleOpenDialog = () => {
    setEventoEditandoId(null);
    setForm({
      fecha: fechaSeleccionada ? format(fechaSeleccionada, "yyyy-MM-dd") : "",
      titulo: "",
      descripcion: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (evento: Evento) => {
    const [day, month, year] = evento.fecha.split("-");
    const fechaInput = `${year}-${month}-${day}`;

    setEventoEditandoId(evento.id);
    setForm({
      fecha: fechaInput,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
    });
    setDialogOpen(true);
  };

  // Prepara la eliminación abriendo el modal de confirmación
  const handleDeleteClick = (id: string) => {
    setEventoAEliminarId(id);
    setDeleteDialogOpen(true);
  };

  // Ejecuta la eliminación real tras la confirmación
  const handleConfirmDelete = () => {
    if (!eventoAEliminarId) return;

    deleteEvento(eventoAEliminarId)
      .then(() => {
        toast.success("Evento eliminado correctamente.");
        setDeleteDialogOpen(false);
        setEventoAEliminarId(null);
        if (onEventAdded) onEventAdded();
      })
      .catch(() => {
        toast.error("Error al eliminar el evento.");
        setDeleteDialogOpen(false);
      });
  };

  const handleSave = () => {
    if (!form.fecha || !form.titulo || !form.descripcion) {
      toast.error("Completá todos los campos.");
      return;
    }

    const [year, month, day] = form.fecha.split("-");
    const fechaParaBackend = `${day}-${month}-${year}`;
    const eventoBody = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      fecha: fechaParaBackend,
      idComision: idComision || "", 
    };

    if (eventoEditandoId) {
      putModificarEvento(eventoEditandoId, eventoBody)
        .then(() => {
          toast.success("Evento modificado correctamente.");
          setDialogOpen(false);
          if (onEventAdded) onEventAdded();
        })
        .catch(() => toast.error("Error al modificar el evento."));
    } else if (idComision) {
      postCrearEventoParaComision(eventoBody)
        .then(() => {
          toast.success("Evento agregado al calendario en comisión.");
          setDialogOpen(false);
          if (onEventAdded) onEventAdded();
        })
        .catch(() => toast.error("Error al guardar el evento."));
    } else {
      postCrearEvento(eventoBody)
        .then(() => {
          toast.success("Evento agregado al calendario.");
          setDialogOpen(false);
          if (onEventAdded) onEventAdded();
        })
        .catch(() => toast.error("Error al guardar el evento."));
    }
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
            const hayEventos = eventos.some((e) => isSameDay(parseFechaBackend(e.fecha), date));
            const seleccionado = fechaSeleccionada && isSameDay(date, fechaSeleccionada);

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
            <div key={i} className="bg-secondary rounded-md px-3 py-2 flex items-center justify-between group">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-medium text-foreground truncate">{e.titulo}</p>
                <p className="text-[10px] text-muted-foreground truncate">{e.descripcion}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(e)}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteClick(e.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-background rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
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

      {/* Modal de Creación/Edición */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{eventoEditandoId ? "Modificar evento" : "Agregar evento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Fecha</Label>
              <Input id="ev-date" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Título del evento</Label>
              <Input id="ev-title" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">Descripción</Label>
              <Input id="ev-desc" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm border rounded-md">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary text-white rounded-md">Guardar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Alerta para Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento desaparecerá permanentemente del calendario global.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventoAEliminarId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}