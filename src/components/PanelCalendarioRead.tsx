import { useState } from "react";
// Importamos 'parse' para transformar el formato dd-MM-yyyy
import { isSameDay, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Evento } from "@/types/eventoType";
import { Calendar } from "@/components/ui/calendar";

interface Props {
  eventos: Evento[];
  idComision?: string;
}

export default function PanelCalendarioRead({ eventos, idComision }: Props) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(
    new Date(),
  );

  // Función para convertir la fecha del backend a un objeto Date válido
  const parseFechaBackend = (fechaStr: string) => {
    return parse(fechaStr, "dd-MM-yyyy", new Date());
  };

  const eventosSeleccionados = fechaSeleccionada
    ? eventos.filter((e) =>
        isSameDay(parseFechaBackend(e.fecha), fechaSeleccionada),
      )
    : [];

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-3 sm:p-5">
      <Calendar
        mode="single"
        selected={fechaSeleccionada}
        onSelect={setFechaSeleccionada}
        locale={es}
        className="flex justify-center p-0"
        components={{
          DayContent: (props) => {
            const date = props.date;
            // Usamos parseFechaBackend antes de comparar
            const hayEventos = eventos.some((e) =>
              isSameDay(parseFechaBackend(e.fecha), date),
            );
            const hayEventosComision = eventos.some(
              (e) =>
                isSameDay(parseFechaBackend(e.fecha), date) &&
                Boolean(e.idComision),
            );
            const seleccionado =
              fechaSeleccionada && isSameDay(date, fechaSeleccionada);

            return (
              <div className="relative w-full h-full flex items-center justify-center">
                <span>{date.getDate()}</span>
                {hayEventos && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      hayEventosComision ? "bg-green-500" : "bg-primary"
                    }`}
                  />
                )}
                {hayEventos && seleccionado && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      hayEventosComision ? "bg-green-500" : "bg-white"
                    }`}
                  />
                )}
              </div>
            );
          },
        }}
      />

      {idComision && (
        <div className="mt-4 pt-4 border-t border-border">
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              <span>Eventos de la comisión</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              <span>Eventos globales</span>
            </li>
          </ul>
        </div>
      )}

      {/* Lista de eventos del día seleccionado */}
      {eventosSeleccionados.length > 0 && fechaSeleccionada && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <p className="text-xs font-semibold text-foreground mb-2">
            {format(fechaSeleccionada, "d 'de' MMMM", { locale: es })}
          </p>
          {eventosSeleccionados.map((e, i) => (
            <div
              key={i}
              className={`${
                e.idComision ? "bg-green-200" : "bg-red-100"
              } rounded-md px-3 py-2`}
            >
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
