import { useState } from "react";
import { commissions, calendarEvents } from "@/data/mockData";
import CommissionDetail from "@/components/CommissionDetail";
import SlidePanel from "@/components/SlidePanel";
import CalendarPanel from "@/components/CalendarPanel";

interface Props {
  showCalendar: boolean;
  onCloseCalendar: () => void;
}

export default function StudentDashboard({ showCalendar, onCloseCalendar }: Props) {
  const studentCommission = commissions.find(c => c.id === "c1")!;
  const studentEvents = calendarEvents.filter(e => e.commissionId === studentCommission.id);

  return (
    <div className="relative">
      <CommissionDetail commission={studentCommission} role="student" />
      <SlidePanel open={showCalendar} onClose={onCloseCalendar} title="Calendario académico">
        <CalendarPanel events={studentEvents} />
      </SlidePanel>
    </div>
  );
}
