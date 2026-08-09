import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { darDeAltaEstudiantes } from "@/service/apiEstudiante";
import { EstudianteBody } from "@/types/estudianteType";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CargaMasivaEstudiantes({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<EstudianteBody[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const CAMPOS_REQUERIDOS = ["nombre", "apellido", "dni", "mail", "carrera"];

  const parsearCSV = (
    texto: string,
  ): { filas: EstudianteBody[]; errores: string[] } => {
    const lineas = texto
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lineas.length < 2) {
      return {
        filas: [],
        errores: [
          "El archivo debe tener al menos una fila de encabezado y una de datos.",
        ],
      };
    }

    const encabezados = lineas[0].split(",").map((h) => h.trim().toLowerCase());
    const erroresEncontrados: string[] = [];

    // Verificar que estén todos los campos requeridos
    const camposFaltantes = CAMPOS_REQUERIDOS.filter(
      (c) => !encabezados.includes(c),
    );
    if (camposFaltantes.length > 0) {
      return {
        filas: [],
        errores: [
          `Faltan las columnas: ${camposFaltantes.join(", ")}. El CSV debe tener: nombre, apellido, mail, carrera.`,
        ],
      };
    }

    const filas: EstudianteBody[] = [];
    lineas.slice(1).forEach((linea, i) => {
      const valores = linea.split(",").map((v) => v.trim());
      const fila: Record<string, string> = {};
      encabezados.forEach((h, j) => {
        fila[h] = valores[j] ?? "";
      });

      // Validaciones básicas
      if (
        !fila.nombre ||
        !fila.apellido ||
        !fila.mail ||
        !fila.carrera ||
        !fila.dni
      ) {
        erroresEncontrados.push(`Fila ${i + 2}: hay campos vacíos.`);
        return;
      }
      if (!fila.mail.includes("@")) {
        erroresEncontrados.push(
          `Fila ${i + 2}: el mail "${fila.mail}" no es válido.`,
        );
        return;
      }

      filas.push({
        nombre: fila.nombre,
        apellido: fila.apellido,
        dni: fila.dni,
        mail: fila.mail,
        carrera: fila.carrera,
        comision_id: null,
      });
    });

    return { filas, errores: erroresEncontrados };
  };

  const handleArchivo = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Solo se aceptan archivos .csv");
      return;
    }
    setArchivo(file);
    setErrores([]);
    setPreview([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = e.target?.result as string;
      const { filas, errores: err } = parsearCSV(texto);
      setPreview(filas);
      setErrores(err);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleArchivo(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleArchivo(file);
  };

  const handleConfirmar = async () => {
    if (preview.length === 0) return;
    setCargando(true);
    console.log("Enviando estudiantes:", preview);
    try {
      await darDeAltaEstudiantes(preview);
      toast.success(
        `${preview.length} estudiantes dados de alta correctamente.`,
      );
      handleCerrar();
      onSuccess();
    } catch {
      toast.error(
        "Error al dar de alta los estudiantes. Verificá que no haya datos duplicados o inválidos.",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleCerrar = () => {
    setArchivo(null);
    setPreview([]);
    setErrores([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleCerrar();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Carga masiva de estudiantes</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Zona de drop */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleInputChange}
            />
            {archivo ? (
              <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                <FileText size={18} className="text-primary" />
                <span>{archivo.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setArchivo(null);
                    setPreview([]);
                    setErrores([]);
                  }}
                  className="ml-1 p-0.5 rounded hover:bg-secondary"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={28} className="mx-auto text-muted-foreground" />
                <p className="text-sm text-foreground font-medium">
                  Arrastrá tu archivo CSV aquí o hacé click para seleccionarlo
                </p>
                <p className="text-xs text-muted-foreground">
                  Columnas requeridas:{" "}
                  <span className="font-mono">
                    nombre, apellido, dni, mail, carrera
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Errores de validación */}
          {errores.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-destructive">
                Se encontraron {errores.length} problema
                {errores.length > 1 ? "s" : ""} en el archivo:
              </p>
              {errores.map((e, i) => (
                <p key={i} className="text-xs text-destructive">
                  {e}
                </p>
              ))}
            </div>
          )}

          {/* Preview de filas válidas */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {preview.length} estudiante{preview.length > 1 ? "s" : ""}{" "}
                listos para dar de alta:
              </p>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="px-3 py-2 text-left font-medium">
                        Nombre
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Apellido
                      </th>
                      <th className="px-3 py-2 text-left font-medium">DNI</th>
                      <th className="px-3 py-2 text-left font-medium">Mail</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Carrera
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((e, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}
                      >
                        <td className="px-3 py-2">{e.nombre}</td>
                        <td className="px-3 py-2">{e.apellido}</td>
                        <td className="px-3 py-2">{e.dni}</td>
                        <td className="px-3 py-2">{e.mail}</td>
                        <td className="px-3 py-2">{e.carrera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleCerrar}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={preview.length === 0 || cargando}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-md font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {cargando
              ? "Cargando..."
              : `Dar de alta ${preview.length > 0 ? `(${preview.length})` : ""}`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
