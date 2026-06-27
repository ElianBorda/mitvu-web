import { SolicitudTutorBody } from "@/types/solicitudTutorType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const crearSolicitudDeTutor = (solicitudTutor: SolicitudTutorBody) => axios.post('/api/solicitudesTutores', solicitudTutor)
export const obtenerSolicitudesPendientes = () => axios.get('/api/solicitudesTutores/pendientes')
export const aprobarSolicitudDeTutor = (idTutor: string) => axios.put(`/api/solicitudesTutores/${idTutor}/aprobar`)
export const rechazarSolicitudDeTutor = (idTutor: string) => axios.put(`/api/solicitudesTutores/${idTutor}/rechazar`)