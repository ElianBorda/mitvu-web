import { Anuncio } from "@/types/anuncioType";
import { Megaphone, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { obtenerTutor } from "@/service/apiTutor";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import {
  crearAnuncioEnComision,
  crearAnuncioGlobal,
  actualizarAnuncio,
  eliminarAnuncio,
} from "@/service/apiAnuncio";
import { obtenerAdministrador } from "@/service/apiAdministrador";

interface Props {
  anuncios: Anuncio[];
  puedePublicar: boolean;
  comisionId: string;
  usuarioId: string;
  role: string;
  actualizarAnuncios: () => void;
}

export default function AnunciosPanel({
  anuncios,
  puedePublicar,
  comisionId,
  usuarioId,
  role,
  actualizarAnuncios,
}: Props) {
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<Anuncio | null>(null);
  const [anuncioAEliminar, setAnuncioAEliminar] = useState<Anuncio | null>(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
  });

  const esEditable = (anuncio: Anuncio) =>
  role === "admin" || anuncio.creadoPorId === usuarioId;

  const handleOpenDialog = () => {
    setAnuncioEditando(null);
    setForm({ titulo: "", descripcion: "" });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (anuncio: Anuncio) => {
    setAnuncioEditando(anuncio);
    setForm({ titulo: anuncio.titulo, descripcion: anuncio.descripcion });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.titulo || !form.descripcion) {
      toast.error("Completá todos los campos.");
      return;
    }

    if (anuncioEditando) {
      const anuncioBody = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        creadoPorId: anuncioEditando.creadoPorId,
      };
      actualizarAnuncio(anuncioEditando.id, anuncioBody)
        .then(() => {
          toast.success("Anuncio actualizado.");
          setDialogOpen(false);
          setAnuncioEditando(null);
          actualizarAnuncios();
        })
        .catch(() => toast.error("Error al actualizar el anuncio."));
    } else {
      const anuncioBody = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        idComision: comisionId,
        creadoPorId: usuarioId,
      };
      crearAnuncioGlobal(anuncioBody)
        .then(() => {
          toast.success("Anuncio agregado.");
          setDialogOpen(false);
          actualizarAnuncios();
        })
        .catch(() => toast.error("Error al guardar el evento."));
    }
  };

  const handleConfirmDelete = () => {
    if (!anuncioAEliminar) return;

    eliminarAnuncio(anuncioAEliminar.id)
      .then(() => {
        toast.success("Anuncio eliminado correctamente.");
        setAnuncioAEliminar(null);
        actualizarAnuncios();
      })
      .catch(() => toast.error("Error al eliminar el anuncio."));
  };

  useEffect(() => {
    const idsToFetch = Array.from(
      new Set(
        anuncios 
          .map((a) => a.creadoPorId)
          .filter((id) => id && !nombres[id]),
      ),
    );

    if (idsToFetch.length === 0) return;

    idsToFetch.forEach(async (id) => {
      try {
        const res = await obtenerTutor(id);
        setNombres((prev) => ({ ...prev, [id]: res.data.nombre + " - Tutor" }));
      } catch {
        try {
          const res = await obtenerAdministrador(id);
          setNombres((prev) => ({
            ...prev,
            [id]: res.data.nombre + " - Administrador",
          }));
        } catch {
          setNombres((prev) => ({ ...prev, [id]: id }));
        }
      }
    });
  }, [anuncios]);

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Anuncios</h3>
        </div>
        {puedePublicar && (
          <div>
            {comisionId ? (
              <button
                onClick={handleOpenDialog}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus size={14} /> Nuevo anuncio en comisión{" "}
              </button>
            ) : (
              <button
                onClick={handleOpenDialog}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus size={14} /> Nuevo anuncio global
              </button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-0">
        {anuncios .length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aún no hay nuevos anuncios publicados.
          </p>
        ) : (
          anuncios .map((a, i) => (
            <div
              key={a.id}
              className={`group relative py-3 px-2 -mx-2 rounded-md transition-colors hover:bg-secondary/50 ${i < anuncios .length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    {a.titulo}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.descripcion}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {String(a.fechaDeCreacion).split("-").reverse().join("-")} ·{" "}
                    {nombres[a.creadoPorId] ?? a.creadoPorId}
                  </p>
                </div>

                {esEditable(a) && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                    <button
                      onClick={() => handleOpenEditDialog(a)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Pencil size={13} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setAnuncioAEliminar(a)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Trash2 size={13} className="text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Creación/Edición */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {anuncioEditando
                ? "Editar anuncio"
                : comisionId
                  ? "Nuevo anuncio en comisión"
                  : "Nuevo anuncio global"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Titulo del anuncio</Label>
              <Input
                id="ev-title"
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">Descripción</Label>
              <Input
                id="ev-desc"
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
              className="px-4 py-2 text-sm border rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md"
            >
              Guardar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <AlertDialog
        open={anuncioAEliminar !== null}
        onOpenChange={(open) => {
          if (!open) setAnuncioAEliminar(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el anuncio "{anuncioAEliminar?.titulo}". Esta
              operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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