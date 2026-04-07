import { useState } from "react";
import { commissions, calendarEvents } from "@/data/mockData";
import CommissionCard from "@/components/CommissionCard";
import CalendarPanel from "@/components/CalendarPanel";
import CommissionDetail from "@/components/CommissionDetail";
import { Commission } from "@/data/types";

export default function TutorDashboard() {
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const tutorCommissions = commissions.filter(c => c.tutorId === "t1");
  const tutorEvents = calendarEvents.filter(e => tutorCommissions.some(c => c.id === e.commissionId));

  if (selectedCommission) {
    return (
      <CommissionDetail
        commission={selectedCommission}
        role="tutor"
        onBack={() => setSelectedCommission(null)}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Commissions */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">Mis comisiones</h1>
          <p className="text-sm text-muted-foreground">{tutorCommissions.length} comisiones asignadas</p>
        </div>
        <div className="space-y-4">
          {tutorCommissions.map(c => (
            <CommissionCard key={c.id} commission={c} onClick={() => setSelectedCommission(c)} />
          ))}
        </div>
      </div>

      {/* Right: Calendar */}
      <div className="w-full lg:w-80 shrink-0">
        <CalendarPanel events={tutorEvents} onAddEvent={() => {}} />
      </div>
    </div>
  );
}
