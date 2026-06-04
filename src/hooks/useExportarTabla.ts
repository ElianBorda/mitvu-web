import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getObtenerComision } from "../service/apiComision";
import { useEffect, useState } from "react";
import { Comision } from "@/types/comisionType";
import { toast } from "sonner";

interface FilaExportable {
  [key: string]: string | number;
}

interface ColumnaExportable {
  key: string;
  label: string;
}

export function useExportarTabla(
  columnas: ColumnaExportable[],
  filas: FilaExportable[],
  view: string,
  comisionId: string | null,
) {
  const [comision, setComision] = useState<Comision | null>(null);
  useEffect(() => {
    if (comisionId) {
      getObtenerComision(comisionId)
        .then(({ data }) => setComision(data))
        .catch(() => toast.error("Error al obtener comisiones"));
    }
  }, [comisionId]);

  let nombreArchivo;
  if (!comision) {
    if (view === "estudiantes")
      nombreArchivo =
        "estudiantes_miVTU_" + new Date().toISOString().split("T")[0];
    else if (view === "estudiantes-baja")
      nombreArchivo =
        "estudiantes-baja_miVTU_" + new Date().toISOString().split("T")[0];
    else if (view === "tutores")
      nombreArchivo = "tutores_miVTU_" + new Date().toISOString().split("T")[0];
    else if (view === "comisiones")
      nombreArchivo =
        "comisiones_miVTU_" + new Date().toISOString().split("T")[0];
    else nombreArchivo = "tabla";
  } else {
    if (view === "estudiantes") {
      nombreArchivo =
        "estudiantes_comision_" +
        comision.numero +
        "_" +
        comision.departamento +
        "_" +
        comision.localidad +
        "_" +
        new Date().toISOString().split("T")[0];
    }
    else if (view === "estudiantes-baja") {
      nombreArchivo =
        "estudiantes-baja_comision_" +
        comision.numero +
        "_" +
        comision.departamento +
        "_" +
        comision.localidad +
        "_" +
        new Date().toISOString().split("T")[0];
    }
    else nombreArchivo = "tabla";
  }
  const exportarCSV = () => {
    const header = columnas.map((c) => c.label).join(",");
    const rows = filas.map((f) =>
      columnas.map((c) => `"${f[c.key] ?? ""}"`).join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${nombreArchivo}.csv`);
  };

  const exportarExcel = () => {
    const datos = filas.map((f) =>
      Object.fromEntries(columnas.map((c) => [c.label, f[c.key] ?? ""])),
    );
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    
    // Excel sheet names are limited to 31 characters
    const sheetName = nombreArchivo.length > 31 ? nombreArchivo.slice(0, 31) : nombreArchivo;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `${nombreArchivo}.xlsx`,
    );
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(13);
    doc.text(nombreArchivo, 14, 16);
    autoTable(doc, {
      head: [columnas.map((c) => c.label)],
      body: filas.map((f) => columnas.map((c) => String(f[c.key] ?? ""))),
      startY: 22,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [120, 20, 30] }, // color primary de tu app
    });
    doc.save(`${nombreArchivo}.pdf`);
  };

  return { exportarCSV, exportarExcel, exportarPDF };
}
