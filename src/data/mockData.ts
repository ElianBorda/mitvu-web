import { Student, Tutor, Commission, Announcement, AttendanceRecord, CalendarEvent, Notification } from "./types";

export const tutors: Tutor[] = [
  {
    id: "t1",
    firstName: "María",
    lastName: "González",
    email: "m.gonzalez@unq.edu.ar",
    preferredSchedule: "Lunes y Miércoles 19:00–21:00",
    locality: "Bernal",
    commissionIds: ["c1", "c2"],
  },
  {
    id: "t2",
    firstName: "Carlos",
    lastName: "Ramírez",
    email: "c.ramirez@unq.edu.ar",
    preferredSchedule: "Martes y Jueves 10:00–12:00",
    locality: "Bernal",
    commissionIds: ["c3"],
  },
];

export const commissions: Commission[] = [
  {
    id: "c1",
    number: 3,
    name: "Comisión 3",
    locality: "Bernal",
    department: "Ciencia y Tecnología",
    classroom: "Aula 45",
    schedule: "Lunes y Miércoles · 19:00–21:00",
    shift: "Noche",
    career: "Lic. en Informática",
    tutorId: "t1",
    studentIds: ["s1", "s2", "s3", "s4"],
  },
  {
    id: "c2",
    number: 7,
    name: "Comisión 7",
    locality: "Bernal",
    department: "Ciencias Sociales",
    classroom: "Aula 12",
    schedule: "Martes y Jueves · 14:00–16:00",
    shift: "Tarde",
    tutorId: "t1",
    studentIds: ["s5", "s6", "s7"],
  },
  {
    id: "c3",
    number: 12,
    name: "Comisión 12",
    locality: "Bernal",
    department: "Ciencia y Tecnología",
    classroom: "Aula 8",
    schedule: "Martes y Jueves · 10:00–12:00",
    shift: "Mañana",
    career: "Ing. en Automatización",
    tutorId: "t2",
    studentIds: ["s8", "s9", "s10", "s11", "s12"],
  },
];

export const students: Student[] = [
  { id: "s1", firstName: "Lucía", lastName: "Martínez", dni: "42.156.789", career: "Lic. en Informática", commissionId: "c1", attendance: ["present", "present", "absent", "present", "present", "present"] },
  { id: "s2", firstName: "Tomás", lastName: "Fernández", dni: "43.987.654", career: "Lic. en Informática", commissionId: "c1", attendance: ["present", "absent", "present", "present", "absent", "present"] },
  { id: "s3", firstName: "Valentina", lastName: "López", dni: "44.321.098", career: "Lic. en Biotecnología", commissionId: "c1", attendance: ["present", "present", "present", "present", "present", "absent"] },
  { id: "s4", firstName: "Mateo", lastName: "García", dni: "41.654.321", career: "Lic. en Informática", commissionId: "c1", attendance: ["absent", "present", "present", "absent", "present", "present"] },
  { id: "s5", firstName: "Camila", lastName: "Rodríguez", dni: "43.111.222", career: "Lic. en Comunicación Social", commissionId: "c2", attendance: ["present", "present", "present", "absent", "present", "present"] },
  { id: "s6", firstName: "Joaquín", lastName: "Pérez", dni: "42.333.444", career: "Lic. en Educación", commissionId: "c2", attendance: ["present", "absent", "absent", "present", "present", "present"] },
  { id: "s7", firstName: "Sofía", lastName: "Díaz", dni: "44.555.666", career: "Lic. en Comunicación Social", commissionId: "c2", attendance: ["present", "present", "present", "present", "absent", "absent"] },
  { id: "s8", firstName: "Benjamín", lastName: "Sosa", dni: "43.777.888", career: "Ing. en Automatización", commissionId: "c3", attendance: ["present", "present", "present", "present", "present", "present"] },
  { id: "s9", firstName: "Martina", lastName: "Torres", dni: "42.999.000", career: "Ing. en Automatización", commissionId: "c3", attendance: ["present", "absent", "present", "present", "present", "absent"] },
  { id: "s10", firstName: "Thiago", lastName: "Morales", dni: "44.111.333", career: "Ing. en Alimentos", commissionId: "c3", attendance: ["absent", "present", "present", "absent", "present", "present"] },
  { id: "s11", firstName: "Emma", lastName: "Ruiz", dni: "41.222.444", career: "Ing. en Automatización", commissionId: "c3", attendance: ["present", "present", "absent", "present", "present", "present"] },
  { id: "s12", firstName: "Nicolás", lastName: "Herrera", dni: "43.555.777", career: "Ing. en Alimentos", commissionId: "c3", attendance: ["present", "present", "present", "present", "absent", "present"] },
];

export const announcements: Announcement[] = [
  { id: "a1", commissionId: "c1", title: "Cambio de aula", body: "El próximo encuentro se realizará en el Aula 50 por refacciones en el Aula 45.", date: "2026-03-25", author: "María González" },
  { id: "a2", commissionId: "c1", title: "Recordatorio: Entrega de encuesta", body: "Recuerden completar la encuesta de diagnóstico antes del viernes.", date: "2026-03-20", author: "Administración" },
  { id: "a3", commissionId: "c1", title: "Bienvenida", body: "¡Bienvenidos al Taller de Vida Universitaria! Nos vemos en el primer encuentro.", date: "2026-03-10", author: "María González" },
  { id: "a4", commissionId: "c2", title: "Material de lectura", body: "Se ha subido el material de lectura para el próximo encuentro al campus virtual.", date: "2026-03-24", author: "María González" },
  { id: "a5", commissionId: "c2", title: "Actividad grupal", body: "Preparen grupos de 4 personas para la actividad del encuentro 4.", date: "2026-03-18", author: "María González" },
  { id: "a6", commissionId: "c2", title: "Bienvenida", body: "¡Bienvenidos a la Comisión 7! Cualquier consulta pueden escribirme.", date: "2026-03-10", author: "María González" },
  { id: "a7", commissionId: "c3", title: "Feriado: no hay clase", body: "El martes 1/4 es feriado. Nos vemos el jueves normalmente.", date: "2026-03-28", author: "Carlos Ramírez" },
  { id: "a8", commissionId: "c3", title: "Encuesta de satisfacción", body: "Por favor completen la encuesta compartida por mail.", date: "2026-03-22", author: "Administración" },
  { id: "a9", commissionId: "c3", title: "Bienvenida", body: "Bienvenidos a la Comisión 12. ¡Arrancamos con todo!", date: "2026-03-10", author: "Carlos Ramírez" },
];

export const attendanceByCommission: Record<string, AttendanceRecord[]> = {
  c1: [
    { encounter: 1, percentage: 75 },
    { encounter: 2, percentage: 75 },
    { encounter: 3, percentage: 75 },
    { encounter: 4, percentage: 75 },
    { encounter: 5, percentage: 75 },
    { encounter: 6, percentage: 75 },
  ],
  c2: [
    { encounter: 1, percentage: 100 },
    { encounter: 2, percentage: 67 },
    { encounter: 3, percentage: 67 },
    { encounter: 4, percentage: 67 },
    { encounter: 5, percentage: 67 },
    { encounter: 6, percentage: 67 },
  ],
  c3: [
    { encounter: 1, percentage: 80 },
    { encounter: 2, percentage: 80 },
    { encounter: 3, percentage: 80 },
    { encounter: 4, percentage: 80 },
    { encounter: 5, percentage: 80 },
    { encounter: 6, percentage: 80 },
  ],
};

export const calendarEvents: CalendarEvent[] = [
  { date: "2026-03-09", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 45" },
  { date: "2026-03-11", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 45" },
  { date: "2026-03-10", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-03-12", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-03-10", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
  { date: "2026-03-12", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
  { date: "2026-03-16", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 45" },
  { date: "2026-03-18", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 45" },
  { date: "2026-03-17", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-03-19", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-03-17", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
  { date: "2026-03-19", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
  { date: "2026-03-23", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 45" },
  { date: "2026-03-25", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 50" },
  { date: "2026-03-24", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-03-26", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-03-24", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
  { date: "2026-03-26", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
  { date: "2026-03-30", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 45" },
  { date: "2026-04-01", commissionId: "c1", commissionName: "Comisión 3", schedule: "19:00–21:00", classroom: "Aula 45" },
  { date: "2026-03-31", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-04-02", commissionId: "c2", commissionName: "Comisión 7", schedule: "14:00–16:00", classroom: "Aula 12" },
  { date: "2026-03-31", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
  { date: "2026-04-02", commissionId: "c3", commissionName: "Comisión 12", schedule: "10:00–12:00", classroom: "Aula 8" },
];

export const notifications: Notification[] = [
  { id: "n1", title: "Nuevo anuncio en Comisión 3", body: "Cambio de aula para el próximo encuentro", date: "2026-03-25", read: false },
  { id: "n2", title: "Recordatorio", body: "Completar la encuesta de diagnóstico", date: "2026-03-20", read: false },
  { id: "n3", title: "Bienvenida al TVU", body: "Ya podés acceder a tu comisión", date: "2026-03-10", read: true },
];

export function getCommissionAvgAttendance(commissionId: string): number {
  const records = attendanceByCommission[commissionId];
  if (!records || records.length === 0) return 0;
  return Math.round(records.reduce((sum, r) => sum + r.percentage, 0) / records.length);
}

export function getTutorForCommission(commissionId: string): Tutor | undefined {
  const commission = commissions.find(c => c.id === commissionId);
  if (!commission) return undefined;
  return tutors.find(t => t.id === commission.tutorId);
}

export function getStudentsForCommission(commissionId: string): Student[] {
  return students.filter(s => s.commissionId === commissionId);
}
