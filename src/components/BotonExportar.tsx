import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";

interface Props {
  onCSV: () => void;
  onExcel: () => void;
  onPDF: () => void;
}

export default function BotonExportar({ onCSV, onExcel, onPDF }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <Download size={14} />
        Exportar tabla
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
          {[
            { label: "CSV",   action: onCSV   },
            { label: "Excel", action: onExcel },
            { label: "PDF",   action: onPDF   },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={() => { action(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}