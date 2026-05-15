import { EventoBody } from "@/types/eventoType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const postCrearEvento = (evento: EventoBody) => axios.post('/api/eventos', evento);
export const postCrearEventoParaComision = (evento: EventoBody) => axios.post('/api/eventos/comision', evento);
export const obtenerTodosLosEventos = () => axios.get('/api/eventos');
export const putModificarEvento = (id: string, evento: EventoBody) => axios.put(`/api/eventos/${id}`, evento);
export const deleteEvento = (id: string) => axios.delete(`/api/eventos/${id}`);
export const obtenerEventosDeUnaComision = (comisionId: string) => axios.get(`/api/eventos/comision/${comisionId}`);