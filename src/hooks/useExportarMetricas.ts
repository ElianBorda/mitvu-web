import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Comision } from "@/types/comisionType";

export function useExportarMetricas(
  refMetricas: React.RefObject<HTMLDivElement>,
  comision: Comision | null,
  nombrePersonalizado?: string,
) {
  const nombreArchivo =
    nombrePersonalizado ??
    (comision
      ? `metricas_comision_${comision.numero}_${comision.departamento}_${comision.localidad}_${new Date().toISOString().split("T")[0]}`
      : `metricas_${new Date().toISOString().split("T")[0]}`);

  const exportarPDF = async () => {
    if (!refMetricas.current) return;

    const canvas = await html2canvas(refMetricas.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Título
    pdf.setFontSize(13);
    pdf.setTextColor(120, 20, 30);
    pdf.text(
      nombrePersonalizado ??
        (comision
          ? `Métricas — Comisión ${comision.numero} · ${comision.localidad} · Dep. ${comision.departamento}`
          : "Métricas de comisión"),
      margin,
      margin,
    );

    // Fecha
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `Generado el ${new Date().toLocaleDateString("es-AR")}`,
      margin,
      margin + 6,
    );

    // Imagen de los gráficos
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const startY = margin + 12;

    // Si la imagen entra en una página
    if (startY + imgHeight <= pageHeight - margin) {
      pdf.addImage(imgData, "PNG", margin, startY, contentWidth, imgHeight);
    } else {
      // Si es muy larga, se divide en páginas
      let yOffset = 0;
      const sliceHeight = pageHeight - startY - margin;

      while (yOffset < imgHeight) {
        if (yOffset > 0) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            "PNG",
            margin,
            margin,
            contentWidth,
            imgHeight,
            "",
            "FAST",
            0,
          );
        } else {
          pdf.addImage(imgData, "PNG", margin, startY, contentWidth, imgHeight);
        }
        yOffset += sliceHeight;
      }
    }

    pdf.save(`${nombreArchivo}.pdf`);
  };

  const exportarPNG = async () => {
    if (!refMetricas.current) return;

    const canvas = await html2canvas(refMetricas.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nombreArchivo}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return { exportarPDF, exportarPNG };
}
