import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { toast } from "sonner";
import { de } from "date-fns/locale";
import { deleteComision } from "@/service/apiComision";
import { set } from "date-fns";

interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
  data: Record<string, any>[];
  onAdd?: () => void;
  view?: string;
  addLabel?: string;
  onEdit?: (row: Record<string, any>) => void;
  onDelete?: (row: Record<string, any>, index: number) => void;
  onRowClick?: (row: Record<string, any>, index: number) => void;
}

export default function DataTable({
  columns,
  data,
  onAdd,
  addLabel = "Agregar",
  onEdit,
  onDelete,
  view,
  onRowClick,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 10;
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (view === "comisiones") {
      deleteComision(data[deleteIndex].id)
        .then(() => {
          toast.success("Elemento eliminado correctamente");
          onDelete?.(data, deleteIndex);
          setDeleteIndex(null);
        })
        .catch(() => {
          toast.error("Error al eliminar el elemento");
        });
    }
  };

  const filtered = data.filter((row) =>
    columns.some((col) =>
      String(row[col.key] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <>
      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full h-8 pl-8 pr-4 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} /> {addLabel}
            </button>
          )}
        </div>
        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-4 py-2.5 text-left font-medium">#</th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2.5 text-left font-medium">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-2.5 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={i}
                className={`group ${i % 2 === 0 ? "bg-card" : "bg-[hsl(350,50%,98%)]"} hover:bg-secondary/50 transition-colors`}
              >
                <td className="px-4 py-2.5 text-muted-foreground">
                  {page * perPage + i + 1}
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-foreground">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right">
                  <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 transition-opacity">
                    <button
                      onClick={() => onRowClick?.(row, page * perPage + i)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Eye size={14} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onEdit?.(row)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Pencil size={14} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteIndex(page * perPage + i)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Mostrando {page * perPage + 1}–
              {Math.min((page + 1) * perPage, filtered.length)} de{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-secondary disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded hover:bg-secondary disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteIndex(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el elemento seleccionado. Esta operación no
              se puede deshacer.
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
    </>
  );
}
