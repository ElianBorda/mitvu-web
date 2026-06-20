// Enums basados en las opciones EXACTAS del backend en Java
export enum UtilidadEncuentro {
  MUCHO = "MUCHO",
  BASTANTE = "BASTANTE",
  POCO = "POCO",
  NADA = "NADA"
}

export enum FrecuenciaEncuentro {
  FUERON_SUFICIENTES = "FUERON_SUFICIENTES",
  FALTARON_ENCUENTROS = "FALTARON_ENCUENTROS",
  FUERON_DEMASIADOS = "FUERON_DEMASIADOS"
}

export enum RespuestaCerrada {
  SI = "SI",
  NO = "NO",
  A_VECES = "A_VECES"
}

export type FormularioFeedbackBody = {
  tutorId: string;
  comisionId: string;
  claridadYComunicacion: number;
  disponibilidadYRespuesta: number;
  tratoYEmpatia: number;
  puntajeGeneralTutor: number;
  utilidadEncuentros: UtilidadEncuentro;
  frecuenciaYAsistencia: FrecuenciaEncuentro;
  organizacion: RespuestaCerrada;
  acompanamientoInstitucional: number;
  recomiendaEspacio: boolean;
  aspectosPositivos?: string | null; 
  oportunidadesMejora?: string | null; 
  comentariosAdicionales?: string | null; 
}

export type FormularioFeedback = {
  id: string;
  tutorId: string;
  comisionId: string;
  fechaEnvio: string;
  claridadYComunicacion: number;
  disponibilidadYRespuesta: number;
  tratoYEmpatia: number;
  puntajeGeneralTutor: number;
  utilidadEncuentros: UtilidadEncuentro;
  frecuenciaYAsistencia: FrecuenciaEncuentro;
  organizacion: RespuestaCerrada;
  acompanamientoInstitucional: number;
  recomiendaEspacio: boolean;
  aspectosPositivos?: string;
  oportunidadesMejora?: string;
  comentariosAdicionales?: string;
}