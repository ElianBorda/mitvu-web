import { EstudianteBody } from "@/types/estudianteType";
import { FormularioBajaType } from "@/types/FormularioBajaType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const crearEstudiante = (estudiante: EstudianteBody) => axios.post('/api/estudiantes', estudiante);
export const obtenerEstudiantesDeComision = (id: string) => axios.get(`/api/estudiantes/comision/${id}`);
export const obtenerTodosLosEstudiantes = () => axios.get("/api/estudiantes");
export const asignarEstudianteAComision = (estudianteId: number, comisionId: string) => axios.put(`/api/estudiantes/${estudianteId}/asignarComision/${comisionId}`);
export const darDeBajaEstudianteDeComision = (estudianteId: string, formularioBaja: FormularioBajaType) => axios.put(`/api/estudiantes/${estudianteId}/baja`, formularioBaja);