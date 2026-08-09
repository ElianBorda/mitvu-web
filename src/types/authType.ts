export enum Rol {
  ADMINISTRADOR = "ADMIN",
  TUTOR = "TUTOR",
  ESTUDIANTE = "ESTUDIANTE"
}

export type LoginBody = {
  dni: string;
  password: string;
};

export type PrimerLogueoBody = {
  dni: string;
  passwordTemporal: string;
  passwordNueva: string;
};

export type LoginData = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  rol: Rol;
  requiereCambioPassword: boolean;
};