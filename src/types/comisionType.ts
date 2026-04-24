import { Tutor } from "./tutorType";

export type ComisionBody = {
  localidad: string;
  departamento: string;
  carrera: string; 
  aula: string;
  horarioInicio: string;
  horarioFin: string;
  diaHabil: string;
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
  diaHabil: string;
  tutor: Tutor;
  estudiantes: string[];
}