import { Anuncio } from "@/types/anuncioType";
import { Megaphone, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { obtenerTutor } from "@/service/apiTutor";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { crearAnuncioEnComision, crearAnuncioGlobal } from "@/service/apiAnuncio";

interface Props {
  anuncios: Anuncio[];
  puedePublicar: boolean;
  comisionId: string;
  usuarioId: string;
  actualizarAnuncios: () => void;
}

export default function AnunciosPanel({
  anuncios,
  puedePublicar,
  comisionId,
  usuarioId,
  actualizarAnuncios,
}: Props) {
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.titulo || !form.descripcion) {
      toast.error("Completá todos los campos.");
      return;
    }

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
    actualizarAnuncios();
  };

  useEffect(() => {
    const idsToFetch = Array.from(
      new Set(
        anuncios
          .map((a) => a.creadoPorId)
          .filter((id) => id && id !== "Administrador" && !nombres[id]),
      ),
    );

    if (idsToFetch.length === 0) return;

    idsToFetch.forEach(async (id) => {
      try {
        const res = await obtenerTutor(id);
        const data = res.data;
        setNombres((prev) => ({ ...prev, [id]: data.nombre ?? id }));
      } catch {
        setNombres((prev) => ({ ...prev, [id]: id }));
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
                {/* Cambiar esto cuando se puedan crear anuncios para una comisión */}
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
        {anuncios?.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aún no hay nuevos anuncios publicados.
          </p>
        ) : (
          anuncios.map((a, i) => (
            <div
              key={a.id}
              className={`py-3 ${i < anuncios.length - 1 ? "border-b border-border" : ""}`}
            >
              <h4 className="text-sm font-medium text-foreground">
                {a.titulo}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {a.descripcion}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {String(a.fechaDeCreacion).split("-").reverse().join("-")} ·{" "}
                {a.creadoPorId === "Administrador"
                  ? "Administrador"
                  : (nombres[a.creadoPorId] ?? a.creadoPorId) + " - Tutor"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal de Creación/Edición */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {comisionId
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
    </div>
  );
}
