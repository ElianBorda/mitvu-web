export enum EstadoAcademico {
  ESTUDIANTE_AVANZADO = "ESTUDIANTE_AVANZADO",
  EGRESADO = "EGRESADO"
}

export enum EstadoDiplomatura {
  REALIZADA = "REALIZADA",
  CURSANDO = "CURSANDO",
  NO_REALIZADA = "NO_REALIZADA"
}

export enum EstadoSolicitud {
  PENDIENTE = "PENDIENTE",
  APROBADA = "APROBADA",
  RECHAZADA = "RECHAZADA"
}

export type SolicitudTutorBody = {
  nombre: string;
  apellido: string;
  correo: string;
  dni: string;
  carrera: string;
  estadoAcademico: EstadoAcademico;
  experienciaComoEgresado: boolean;
  fueTutorAnteriormente: boolean;
  estadoDiplomatura: EstadoDiplomatura;
}

export type SolicitudTutor = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  dni: string;
  carrera: string;
  estadoAcademico: EstadoAcademico;
  experienciaComoEgresado: boolean;
  fueTutorAnteriormente: boolean;
  estadoDiplomatura: EstadoDiplomatura;
  fechaPostulacion: string; 
  estadoSolicitud: EstadoSolicitud;
}