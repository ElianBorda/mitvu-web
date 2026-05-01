import { EventoBody } from "@/types/eventoType";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const postCrearEvento = (evento: EventoBody) => axios.post('/api/eventos', evento);
export const obtenerTodosLosEventos = () => axios.get('/api/eventos');