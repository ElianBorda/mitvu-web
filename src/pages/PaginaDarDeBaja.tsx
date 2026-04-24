import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RAZON_BAJA } from "@/types/RazonDarDeBajaType";
import { darDeBajaEstudianteDeComision } from "@/service/apiEstudiante";

const PaginaDarDeBaja = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Por favor seleccioná un motivo.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    darDeBajaEstudianteDeComision(id, {motivo: reason, detalle: detail}).then(() => {
      localStorage.setItem("studentUnenrolled", "true");
      setConfirmOpen(false);
      toast.success("Te diste de baja del taller.");
      navigate("/");
    }).catch(() => {
      toast.error("Error al dar de baja.");
      setConfirmOpen(false);
    })
  };

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </button>
        <div className="bg-card rounded-xl shadow-card border border-border p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
            Darse de baja del taller
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Lamentamos que quieras dejar el taller. Contanos el motivo para poder mejorar.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Seleccionar motivo..." />
                </SelectTrigger>
                <SelectContent>
                  {RAZON_BAJA.map(r => (
                    <SelectItem key={r.key} value={r.key}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail">
                Detallanos tu motivo por el que te vas del taller (opcional)
              </Label>
              <Textarea
                id="detail"
                placeholder="Contanos un poco más..."
                value={detail}
                onChange={e => setDetail(e.target.value)}
                rows={5}
                className="resize-none" // Evitamos que el usuario estire el textarea y genere scroll
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Confirmar baja
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de darte de baja?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción te dará de baja del taller y perderás el acceso a tu comisión actual.
              No podrás revertirla desde acá.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, darme de baja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PaginaDarDeBaja;