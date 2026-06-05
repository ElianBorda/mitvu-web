export type MetricaType = {
  cantidadDeEstudiantesDadoDeBaja: number,
  cantidadTotalDeEstudiantes: number, 
  cantidadDeEstudiantesActivos: number,
}

export enum TipoMetrica {
  BAJA = "BAJA",
  ASISTENCIA = "ASISTENCIA",
}

export enum Agrupacion {
  COMISION = "COMISION",
  MOTIVO = "MOTIVO",
  FECHA = "FECHA",
  ANIO = "ANIO",
}

export enum TipoCalculo {
  CANTIDAD = "CANTIDAD",
  PORCENTAJE = "PORCENTAJE",
}

export enum TipoDeAsistencia {
  PRESENTE = "PRESENTE",
  AUSENTE = "AUSENTE",
  AUSENCIA_JUSTIFICADA = "AUSENCIA_JUSTIFICADA",
}

export enum MotivoBaja {
  FALTA_DE_TIEMPO = "FALTA_DE_TIEMPO",
  CAMBIO_INSTITUCION = "CAMBIO_INSTITUCION",
  MOTIVOS_PERSONALES = "MOTIVOS_PERSONALES",
  PROBLEMAS_CURSADAS = "PROBLEMAS_CURSADAS",
  DISTANCIA_GEOGRAFICA = "DISTANCIA_GEOGRAFICA",
  FALTA_INFORMACION = "FALTA_INFORMACION",
  DESACUERDO_BUROCRACIA = "DESACUERDO_BUROCRACIA",
  OTRO = "OTRO",
}

export type FiltroMetricaBody = {
  tipoMetrica: TipoMetrica,
  fechaInicio?: string,
  fechaFin?: string,
  idComision?: string,
  agruparPor: Agrupacion,
  tipoDeAsistencia?: TipoDeAsistencia | null,
  motivoBaja?: MotivoBaja | null,
  tipoCalculo: TipoCalculo,
}

export type DataPoint = {
  etiqueta: string,
  valor: number,
}