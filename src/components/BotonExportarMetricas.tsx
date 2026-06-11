import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";

interface Props {
  onPDF: () => Promise<void>;
  onPNG: () => Promise<void>;
}

export default function BotonExportarMetricas({ onPDF, onPNG }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (action: () => Promise<void>) => {
    setOpen(false);
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
      >
        <Download size={14} />
        {loading ? "Exportando..." : "Exportar métricas"}
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
          {[
            { label: "PDF",  action: onPDF },
            { label: "PNG",  action: onPNG },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={() => handleClick(action)}
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