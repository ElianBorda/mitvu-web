export type Role = "student" | "tutor" | "admin";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  career: string;
  commissionId: string;
  attendance: ("present" | "absent" | "none")[];
}

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  preferredSchedule: string;
  locality: string;
  commissionIds: string[];
}

export interface Commission {
  id: string;
  number: number;
  name: string;
  locality: string;
  department: string;
  classroom: string;
  schedule: string;
  shift: string;
  career?: string;
  tutorId: string;
  studentIds: string[];
}

export interface Announcement {
  id: string;
  commissionId: string;
  title: string;
  body: string;
  date: string;
  author: string;
}

export interface AttendanceRecord {
  encounter: number;
  percentage: number;
}

export interface CalendarEvent {
  date: string;
  commissionId: string;
  commissionName: string;
  schedule: string;
  classroom: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}
