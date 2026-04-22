import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerEstudiantesDeComision = (id: string) => axios.get(`/api/estudiantes/comision/${id}`);
export const obtenerTodosLosEstudiantes = () => axios.get("/api/estudiantes");