import axios from "axios";
import { TutorBody } from "@/types/tutorType";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const obtenerTodosLosTutores = () => axios.get('/api/tutores');
export const obtenerTutorDeLaComision = (id: string) => axios.get(`/api/tutores/comision/${id}`);
export const crearTutor = (tutor: TutorBody) => axios.post('/api/tutores', tutor);
export const obtenerTutor = (id: string) => axios.get(`/api/tutores/${id}`);
export const modificarTutor = (id: string, tutor: TutorBody) => axios.put(`/api/tutores/${id}`, tutor);