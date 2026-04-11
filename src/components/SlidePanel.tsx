import { X } from "lucide-react";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlidePanel({ open, onClose, title, children }: SlidePanelProps) {
  return (
    <div
      className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-[400px] bg-card border-l border-border shadow-lg z-20 transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
          <X size={18} className="text-muted-foreground" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto h-[calc(100%-3.5rem)]">
        {children}
      </div>
    </div>
  );
}
