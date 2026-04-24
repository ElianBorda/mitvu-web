import { Commission } from "@/data/types";
import { getCommissionAvgAttendance, getStudentsForCommission, getTutorForCommission } from "@/data/mockData";
import { MapPin, Clock, Users } from "lucide-react";

interface Props {
  commission: Commission;
  onClick: () => void;
}

export default function CommissionCard({ commission, onClick }: Props) {
  const avg = getCommissionAvgAttendance(commission.id);
  const studentCount = getStudentsForCommission(commission.id).length;
  const tutor = getTutorForCommission(commission.id);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-lg shadow-card p-5 hover:shadow-md transition-shadow border border-border group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {commission.name} — {commission.locality}
          </h3>
          {tutor && (
            <p className="text-xs text-muted-foreground mt-0.5">Tutor/a: {tutor.firstName} {tutor.lastName}</p>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
          <Users size={12} />
          {studentCount}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><MapPin size={12} /> {commission.locality}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {commission.schedule}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Asistencia promedio</span>
          <span className="font-semibold text-foreground">{avg}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${avg}%` }}
          />
        </div>
      </div>
    </button>
  );
}
