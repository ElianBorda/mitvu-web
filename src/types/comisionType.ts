import { Tutor } from "./TutorType";

export type ComisionBody = {
  localidad: string;
  departamento: string;
  carrera: string; 
  aula: string;
  horarioInicio: string;
  horarioFin: string;
}

export type Comision = {
  id: string;
  numero: number;
  localidad: string;
  departamento: string;
  carrera: string; 
  aula: string;
  horarioInicio: string;
  horarioFin: string;
  turno: string; 
  tutor: Tutor;
  estudiantes: string[];
}