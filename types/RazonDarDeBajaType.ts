export enum RazonDarDeBaja {
  FALTA_DE_TIEMPO = "Falta de tiempo",
  CAMBIO_INSTITUCION = "Cambio de institución",
  MOTIVOS_PERSONALES = "Motivos personales",
  PROBLEMAS_CURSADAS = "Problemas con la cursada",
  DISTANCIA_GEOGRAFICA = "Distancia geografica",
  FALTA_INFORMACION = "Falta de información",
  DESACUERDO_BUROCRACIA = "Desacuerdo con la burocracia",
  OTRO = "Otro",
}
export const RAZON_BAJA: { key: keyof typeof RazonDarDeBaja; label: string }[] = [
  { key: "FALTA_DE_TIEMPO", label: RazonDarDeBaja.FALTA_DE_TIEMPO },
  { key: "CAMBIO_INSTITUCION", label: RazonDarDeBaja.CAMBIO_INSTITUCION },
  { key: "MOTIVOS_PERSONALES", label: RazonDarDeBaja.MOTIVOS_PERSONALES },
  { key: "PROBLEMAS_CURSADAS", label: RazonDarDeBaja.PROBLEMAS_CURSADAS },
  { key: "DISTANCIA_GEOGRAFICA", label: RazonDarDeBaja.DISTANCIA_GEOGRAFICA },
  { key: "FALTA_INFORMACION", label: RazonDarDeBaja.FALTA_INFORMACION },
  { key: "DESACUERDO_BUROCRACIA", label: RazonDarDeBaja.DESACUERDO_BUROCRACIA },
  { key: "OTRO", label: RazonDarDeBaja.OTRO },
];