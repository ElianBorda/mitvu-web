import { Notificacion } from "@/types/notificacionType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const guardarNotificacion = ({ idUsuario, titulo, descripcion, fecha, read}: Notificacion) => axios.post('/api/notificaciones', {
  idUsuario,
  titulo,
  cuerpo: descripcion,
  fecha,
  leida: read
});

export const obtenerNotificacionesPorUsuario = (idUsuario: string) => axios.get(`/api/notificaciones/usuario/${idUsuario}`);
export const marcarNotificacionComoLeida = (id: string) => axios.put(`/api/notificaciones/${id}/leer`);