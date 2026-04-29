import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Evento } from "@/types/eventoType";

interface Props {
  eventos: Evento[];
}

export default function PanelCalendario({ eventos }: Props) {
  const [mesActual, setMesActual] = useState(() => startOfMonth(new Date()));
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);

  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 });
    const d: Date[] = [];
    let dia = inicio;
    while (dia <= fin) {
      d.push(dia);
      dia = addDays(dia, 1);
    }
    return d;
  }, [mesActual]);

  const eventosDeFecha = (fecha: Date) => {
    console.log("Filtrando eventos para fecha:", fecha);
    console.log(
      "Fechas: ",
      eventos.map((e) => ({ ...e, fecha: new Date(e.fecha) })),
    );
    console.log(
      "Eventos que coinciden: ",
      eventos.filter((e) => isSameDay(new Date(e.fecha), fecha)),
    );
    return eventos.filter((e) => isSameDay(new Date(e.fecha), fecha));
  };

  const eventosSeleccionados = fechaSeleccionada
    ? eventosDeFecha(fechaSeleccionada)
    : [];

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMesActual(subMonths(mesActual, 1))}
          className="p-1 hover:bg-secondary rounded"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-sm font-semibold text-foreground capitalize">
          {format(mesActual, "MMMM yyyy", { locale: es })}
        </h3>
        <button
          onClick={() => setMesActual(addMonths(mesActual, 1))}
          className="p-1 hover:bg-secondary rounded"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dia headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Dia */}
      <div className="grid grid-cols-7 gap-0">
        {dias.map((dia, i) => {
          const hayEventos = eventosDeFecha(dia).length > 0;
          const esHoy = isSameDay(dia, new Date());
          const seleccionado =
            fechaSeleccionada && isSameDay(dia, fechaSeleccionada);
          const estaEnElMesActual = isSameMonth(dia, mesActual);

          return (
            <button
              key={i}
              onClick={() =>
                hayEventos
                  ? setFechaSeleccionada(dia)
                  : setFechaSeleccionada(null)
              }
              className={`relative h-9 text-xs font-medium rounded transition-colors
                ${estaEnElMesActual ? "text-foreground" : "text-muted-foreground/40"}
                ${seleccionado ? "bg-primary text-primary-foreground" : esHoy ? "bg-secondary" : "hover:bg-secondary"}
              `}
            >
              {format(dia, "d")}
              {hayEventos && !seleccionado && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date eventos */}
      {eventosSeleccionados.length > 0 && fechaSeleccionada && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <p className="text-xs font-semibold text-foreground mb-2">
            {format(fechaSeleccionada, "d 'de' MMMM", { locale: es })}
          </p>
          {eventosSeleccionados.map((e, i) => (
            <div key={i} className="bg-secondary rounded-md px-3 py-2">
              <p className="text-xs font-medium text-foreground">{e.titulo}</p>
              <p className="text-[10px] text-muted-foreground">
                {e.descripcion}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
