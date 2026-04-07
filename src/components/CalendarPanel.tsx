import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarEvent } from "@/data/types";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  events: CalendarEvent[];
  onAddEvent?: () => void;
}

export default function CalendarPanel({ events, onAddEvent }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const d: Date[] = [];
    let day = start;
    while (day <= end) {
      d.push(day);
      day = addDays(day, 1);
    }
    return d;
  }, [currentMonth]);

  const eventsForDate = (date: Date) =>
    events.filter(e => isSameDay(new Date(e.date), date));

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-secondary rounded">
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-sm font-semibold text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-secondary rounded">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          const hasEvents = eventsForDate(day).length > 0;
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={i}
              onClick={() => hasEvents ? setSelectedDate(day) : setSelectedDate(null)}
              className={`relative h-9 text-xs font-medium rounded transition-colors
                ${inMonth ? "text-foreground" : "text-muted-foreground/40"}
                ${isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-secondary" : "hover:bg-secondary"}
              `}
            >
              {format(day, "d")}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date events */}
      {selectedEvents.length > 0 && selectedDate && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <p className="text-xs font-semibold text-foreground mb-2">
            {format(selectedDate, "d 'de' MMMM", { locale: es })}
          </p>
          {selectedEvents.map((e, i) => (
            <div key={i} className="bg-secondary rounded-md px-3 py-2">
              <p className="text-xs font-medium text-foreground">{e.commissionName}</p>
              <p className="text-[10px] text-muted-foreground">{e.schedule} · {e.classroom}</p>
            </div>
          ))}
        </div>
      )}

      {onAddEvent && (
        <button
          onClick={onAddEvent}
          className="mt-4 w-full py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          + Agregar evento
        </button>
      )}
    </div>
  );
}
